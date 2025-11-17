<?php
declare(strict_types=1);

final class ServiceController
{
    public static function list(): void
    {
        require_method('GET');
        $pdo = Database::get();
        $stmt = $pdo->query('SELECT id, name, description, is_active FROM services WHERE is_active = 1 ORDER BY name');
        json_response(['services' => $stmt->fetchAll()]);
    }

    public static function create(): void
    {
        require_auth('admin');
        require_method('POST');
        $pdo = Database::get();
        $data = body_json();
        $name = trim($data['name'] ?? '');
        $description = (string)($data['description'] ?? null);
        if ($name === '') json_response(['error' => 'Name is required'], 422);
        $stmt = $pdo->prepare('INSERT INTO services (name, description, is_active) VALUES (?, ?, 1)');
        try {
            $stmt->execute([$name, $description]);
        } catch (PDOException $e) {
            if ($e->errorInfo[1] === 1062) json_response(['error' => 'Service name already exists'], 409);
            throw $e;
        }
        json_response(['message' => 'Service created']);
    }
}
