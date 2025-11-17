<?php
declare(strict_types=1);

final class IssuedDocumentsController
{
    private static function ensureTable(): void
    {
        $pdo = Database::get();
        $pdo->exec("CREATE TABLE IF NOT EXISTS issued_documents (
            id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
            service_id BIGINT UNSIGNED NOT NULL,
            format_id BIGINT UNSIGNED NOT NULL,
            resident_id BIGINT UNSIGNED NULL,
            requester_full_name VARCHAR(150) NOT NULL,
            control_no VARCHAR(50) NOT NULL,
            details_json JSON NULL,
            issued_at VARCHAR(120) NULL,
            issued_on DATE NULL,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY uq_control_no (control_no),
            KEY ix_service (service_id),
            KEY ix_format (format_id),
            CONSTRAINT fk_issued_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT fk_issued_format FOREIGN KEY (format_id) REFERENCES document_formats(id) ON DELETE RESTRICT ON UPDATE CASCADE,
            CONSTRAINT fk_issued_resident FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
        ) ENGINE=InnoDB");
    }

    private static function generateControlNo(): string
    {
        $year = date('Y');
        $rand = strtoupper(bin2hex(random_bytes(3))); // 6 hex chars
        return "BRGY-$year-$rand";
    }

    public static function create(): void
    {
        require_auth('admin');
        require_method('POST');
        self::ensureTable();
        $pdo = Database::get();
        $d = body_json();
        $service_id = (int)($d['service_id'] ?? 0);
        $format_id = (int)($d['format_id'] ?? 0);
        $resident_id = isset($d['resident_id']) ? (int)$d['resident_id'] : null;
        $name = trim((string)($d['requester_full_name'] ?? ''));
        $issued_at = isset($d['issued_at']) ? trim((string)$d['issued_at']) : null;
        $issued_on = isset($d['issued_on']) ? date('Y-m-d', strtotime((string)$d['issued_on'])) : null;
        $details = isset($d['details']) ? json_encode($d['details']) : null;
        $control_no = trim((string)($d['control_no'] ?? ''));

        if ($service_id <= 0 || $format_id <= 0 || $name === '') {
            if ($service_id <= 0 || $name === '') {
                json_response(['error' => 'service_id and requester_full_name are required'], 422);
            }
        }
        if ($control_no === '') {
            $control_no = self::generateControlNo();
        }

        // Ensure a document format exists for this service if none provided
        if ($format_id <= 0) {
            // Create document_formats table if missing (minimal schema compatible with DocumentFormatsController)
            $pdo->exec("CREATE TABLE IF NOT EXISTS document_formats (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                service_id BIGINT UNSIGNED NOT NULL,
                name VARCHAR(120) NOT NULL,
                format_image_url VARCHAR(255) NULL,
                notes TEXT NULL,
                is_active TINYINT(1) NOT NULL DEFAULT 1,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
                PRIMARY KEY (id),
                KEY ix_df_service (service_id)
            ) ENGINE=InnoDB");
            // Try to find an existing format for the service
            $stmtFmt = $pdo->prepare('SELECT id FROM document_formats WHERE service_id = ? ORDER BY id LIMIT 1');
            $stmtFmt->execute([$service_id]);
            $rowFmt = $stmtFmt->fetch();
            if ($rowFmt && isset($rowFmt['id'])) {
                $format_id = (int)$rowFmt['id'];
            } else {
                // Create a default format record
                $stmtInsFmt = $pdo->prepare('INSERT INTO document_formats (service_id, name, format_image_url, notes, is_active) VALUES (?, ?, NULL, ?, 1)');
                $stmtInsFmt->execute([$service_id, 'Default Format', 'Auto-created for issue']);
                $format_id = (int)$pdo->lastInsertId();
            }
        }

        $stmt = $pdo->prepare('INSERT INTO issued_documents (service_id, format_id, resident_id, requester_full_name, control_no, details_json, issued_at, issued_on) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        try {
            $stmt->execute([$service_id, $format_id, $resident_id, $name, $control_no, $details, $issued_at, $issued_on]);
        } catch (PDOException $e) {
            if (($e->errorInfo[1] ?? 0) === 1062) {
                json_response(['error' => 'Duplicate control number'], 409);
            }
            throw $e;
        }
        $id = (int)$pdo->lastInsertId();
        json_response(['message' => 'Issued', 'id' => $id, 'control_no' => $control_no]);
    }

    public static function get(int $id): void
    {
        require_auth('admin');
        require_method('GET');
        self::ensureTable();
        $pdo = Database::get();
        $stmt = $pdo->prepare('SELECT id, service_id, format_id, resident_id, requester_full_name, control_no, details_json, issued_at, issued_on, created_at FROM issued_documents WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_response(['error' => 'Not Found'], 404);
        json_response(['document' => $row]);
    }
}
