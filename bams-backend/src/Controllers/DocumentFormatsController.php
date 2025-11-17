<?php
declare(strict_types=1);

final class DocumentFormatsController
{
    private static function ensureTable(): void
    {
        $pdo = Database::get();
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
            KEY ix_df_service (service_id),
            CONSTRAINT fk_df_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE ON UPDATE CASCADE
        ) ENGINE=InnoDB");
    }

    public static function list(): void
    {
        require_auth('admin');
        require_method('GET');
        self::ensureTable();
        $pdo = Database::get();
        // Seed defaults when empty
        $cnt = (int)$pdo->query('SELECT COUNT(*) FROM document_formats')->fetchColumn();
        if ($cnt === 0) {
            $services = $pdo->query("SELECT id, name FROM services")->fetchAll();
            $byName = [];
            foreach ($services as $s) { $byName[$s['name']] = (int)$s['id']; }
            $defaults = [
                ['name' => 'Barangay ID Card', 'service' => 'Barangay ID', 'url' => '/doc-format-barangay-id.svg', 'notes' => 'Front layout sample'],
                ['name' => 'Barangay Clearance', 'service' => 'Barangay Clearance', 'url' => '/doc-format-clearance.svg', 'notes' => 'Clearance template'],
                ['name' => 'Proof of Residency', 'service' => 'Certificate of Residency', 'url' => '/doc-format-residency.svg', 'notes' => 'Certificate template'],
            ];
            $ins = $pdo->prepare('INSERT INTO document_formats (service_id, name, format_image_url, notes, is_active) VALUES (?, ?, ?, ?, 1)');
            foreach ($defaults as $d) {
                if (!isset($byName[$d['service']])) continue;
                $ins->execute([$byName[$d['service']], $d['name'], $d['url'], $d['notes']]);
            }
        }
        $stmt = $pdo->query('SELECT id, service_id, name, format_image_url, notes, is_active, created_at, updated_at FROM document_formats ORDER BY created_at DESC');
        json_response(['formats' => $stmt->fetchAll()]);
    }

    public static function create(): void
    {
        require_auth('admin');
        require_method('POST');
        self::ensureTable();
        $pdo = Database::get();
        $d = body_json();
        $service_id = (int)($d['service_id'] ?? 0);
        $name = trim((string)($d['name'] ?? ''));
        $url = isset($d['format_image_url']) ? trim((string)$d['format_image_url']) : null;
        $notes = isset($d['notes']) ? (string)$d['notes'] : null;
        $active = isset($d['is_active']) ? (int)!!$d['is_active'] : 1;
        if ($service_id <= 0) json_response(['error' => 'service_id required'], 422);
        if ($name === '') json_response(['error' => 'name required'], 422);
        $stmt = $pdo->prepare('INSERT INTO document_formats (service_id, name, format_image_url, notes, is_active) VALUES (?, ?, ?, ?, ?)');
        $stmt->execute([$service_id, $name, $url, $notes, $active]);
        json_response(['message' => 'Format created']);
    }

    public static function get(int $id): void
    {
        require_auth('admin');
        require_method('GET');
        self::ensureTable();
        $pdo = Database::get();
        $stmt = $pdo->prepare('SELECT id, service_id, name, format_image_url, notes, is_active, created_at, updated_at FROM document_formats WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        if (!$row) json_response(['error' => 'Not Found'], 404);
        json_response(['format' => $row]);
    }

    public static function update(int $id): void
    {
        require_auth('admin');
        require_method('PATCH');
        self::ensureTable();
        $pdo = Database::get();
        $d = body_json();
        $fields = [];
        $params = [];
        if (array_key_exists('service_id', $d)) { $fields[] = 'service_id = ?'; $params[] = (int)$d['service_id']; }
        if (array_key_exists('name', $d)) { $fields[] = 'name = ?'; $params[] = trim((string)$d['name']); }
        if (array_key_exists('format_image_url', $d)) { $fields[] = 'format_image_url = ?'; $params[] = $d['format_image_url'] !== null ? trim((string)$d['format_image_url']) : null; }
        if (array_key_exists('notes', $d)) { $fields[] = 'notes = ?'; $params[] = $d['notes']; }
        if (array_key_exists('is_active', $d)) { $fields[] = 'is_active = ?'; $params[] = (int)!!$d['is_active']; }
        if (!$fields) json_response(['error' => 'No changes'], 422);
        $params[] = $id;
        $sql = 'UPDATE document_formats SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        json_response(['message' => 'Format updated']);
    }

    public static function delete(int $id): void
    {
        require_auth('admin');
        require_method('DELETE');
        self::ensureTable();
        $pdo = Database::get();
        $stmt = $pdo->prepare('DELETE FROM document_formats WHERE id = ?');
        $stmt->execute([$id]);
        json_response(['message' => 'Format deleted']);
    }
}
