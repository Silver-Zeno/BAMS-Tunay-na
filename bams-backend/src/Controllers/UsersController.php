<?php
declare(strict_types=1);

final class UsersController
{
    public static function list(): void
    {
        $admin = require_auth('admin');
        require_method('GET');
        $pdo = Database::get();
        $stmt = $pdo->query('SELECT id, role, full_name, email, phone, address, status, created_at FROM users ORDER BY created_at DESC');
        json_response(['users' => $stmt->fetchAll()]);
    }

    public static function get(int $id): void
    {
        $admin = require_auth('admin');
        require_method('GET');
        $pdo = Database::get();
        $stmt = $pdo->prepare('SELECT id, role, full_name, email, phone, address, status, created_at FROM users WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if (!$user) json_response(['error' => 'Not Found'], 404);
        json_response(['user' => $user]);
    }

    public static function delete(int $id): void
    {
        $admin = require_auth('admin');
        require_method('DELETE');
        $pdo = Database::get();
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
        try {
            $stmt->execute([$id]);
        } catch (PDOException $e) {
            // Likely foreign key constraint (e.g., appointments exist)
            if ($e->errorInfo[1] === 1451) {
                json_response(['error' => 'Cannot delete user with related records'], 409);
            }
            throw $e;
        }
        json_response(['message' => 'User deleted']);
    }
}
