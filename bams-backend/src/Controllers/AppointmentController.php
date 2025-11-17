<?php
declare(strict_types=1);

final class AppointmentController
{
    public static function create(): void
    {
        $user = require_auth('resident');
        require_method('POST');
        $pdo = Database::get();
        $data = body_json();

        $service_id = (int)($data['service_id'] ?? 0);
        $slot_id = isset($data['slot_id']) ? (int)$data['slot_id'] : null;
        $preferred = isset($data['preferred_datetime']) ? date('Y-m-d H:i:s', strtotime($data['preferred_datetime'])) : null;
        $purpose = isset($data['purpose']) ? trim((string)$data['purpose']) : null;
        $details = isset($data['details']) && is_array($data['details']) ? $data['details'] : null;

        if ($service_id <= 0) json_response(['error' => 'service_id required'], 422);
        if ($purpose === null || $purpose === '') json_response(['error' => 'purpose required'], 422);

        $pdo->beginTransaction();
        try {
            if ($slot_id) {
                // check slot availability and increment
                $stmt = $pdo->prepare('SELECT capacity, booked_count, status FROM appointment_slots WHERE id = ? AND service_id = ? FOR UPDATE');
                $stmt->execute([$slot_id, $service_id]);
                $slot = $stmt->fetch();
                if (!$slot || $slot['status'] !== 'open' || $slot['booked_count'] >= $slot['capacity']) {
                    throw new RuntimeException('Slot not available');
                }
                $pdo->prepare('UPDATE appointment_slots SET booked_count = booked_count + 1 WHERE id = ?')->execute([$slot_id]);
            }

            $ref = reference_no();
            $notes = $purpose;
            if ($details) {
                $notes = json_encode(['purpose' => $purpose, 'details' => $details], JSON_UNESCAPED_UNICODE);
            }
            $stmt = $pdo->prepare('INSERT INTO appointments (reference_no, resident_id, service_id, slot_id, preferred_datetime, notes) VALUES (?, ?, ?, ?, ?, ?)');
            $stmt->execute([$ref, $user['id'], $service_id, $slot_id, $preferred, $notes]);
            $apptId = (int)$pdo->lastInsertId();
            $pdo->prepare('INSERT INTO appointment_logs (appointment_id, actor_user_id, action, message) VALUES (?, ?, ?, ?)')
                ->execute([$apptId, $user['id'], 'created', 'Appointment requested']);
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            json_response(['error' => $e->getMessage()], 409);
        }

        json_response(['message' => 'Appointment created']);
    }

    public static function list(): void
    {
        $user = require_auth();
        require_method('GET');
        $pdo = Database::get();

        if ($user['role'] === 'admin') {
            $stmt = $pdo->query('SELECT a.id, a.reference_no, a.status, a.created_at, u.full_name AS resident, s.name AS service
                                 FROM appointments a
                                 JOIN users u ON u.id = a.resident_id
                                 JOIN services s ON s.id = a.service_id
                                 ORDER BY a.created_at DESC');
        } else {
            $stmt = $pdo->prepare('SELECT a.id, a.reference_no, a.status, a.created_at, a.notes, s.name AS service
                                   FROM appointments a
                                   JOIN services s ON s.id = a.service_id
                                   WHERE a.resident_id = ?
                                   ORDER BY a.created_at DESC');
            $stmt->execute([$user['id']]);
        }

        json_response(['appointments' => $stmt->fetchAll()]);
    }

    public static function get(int $id): void
    {
        $admin = require_auth('admin');
        require_method('GET');
        $pdo = Database::get();
        $stmt = $pdo->prepare('SELECT a.id, a.reference_no, a.status, a.created_at, a.preferred_datetime, a.notes,
                                      u.id as resident_id, u.full_name as resident_name, u.email as resident_email,
                                      s.id as service_id, s.name as service_name
                               FROM appointments a
                               JOIN users u ON u.id = a.resident_id
                               JOIN services s ON s.id = a.service_id
                               WHERE a.id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_response(['error' => 'Not Found'], 404);
        json_response(['appointment' => $row]);
    }

    public static function updateStatus(int $id): void
    {
        $admin = require_auth('admin');
        require_method('PATCH');
        $pdo = Database::get();
        $data = body_json();
        $status = $data['status'] ?? '';
        if (!in_array($status, ['approved','rejected','cancelled','completed'], true)) {
            json_response(['error' => 'Invalid status'], 422);
        }
        $stmt = $pdo->prepare('UPDATE appointments SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);
        $pdo->prepare('INSERT INTO appointment_logs (appointment_id, actor_user_id, action, message) VALUES (?, ?, ?, ?)')
            ->execute([$id, $admin['id'], 'status_changed', 'Status set to ' . $status]);
        json_response(['message' => 'Status updated']);
    }

    public static function delete(int $id): void
    {
        $admin = require_auth('admin');
        require_method('DELETE');
        $pdo = Database::get();
        $pdo->beginTransaction();
        try {
            // find appointment and slot
            $stmt = $pdo->prepare('SELECT id, slot_id FROM appointments WHERE id = ? FOR UPDATE');
            $stmt->execute([$id]);
            $appt = $stmt->fetch();
            if (!$appt) {
                $pdo->rollBack();
                json_response(['error' => 'Not Found'], 404);
            }

            if (!empty($appt['slot_id'])) {
                // decrement booked_count but not below zero
                $pdo->prepare('UPDATE appointment_slots SET booked_count = GREATEST(booked_count - 1, 0) WHERE id = ?')
                    ->execute([(int)$appt['slot_id']]);
            }

            // delete appointment (logs/documents cascade)
            $pdo->prepare('DELETE FROM appointments WHERE id = ?')->execute([$id]);
            $pdo->commit();
        } catch (Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
        json_response(['message' => 'Appointment deleted']);
    }
}
