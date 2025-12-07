<?php
declare(strict_types=1);

final class UsersController
{
    // -------------------------------
    // REGISTER (POST /register)
    // -------------------------------
    public static function register(): void
    {
        require_method('POST');
        $pdo = Database::get();
        $data = json_input();

        // Validate required fields
        if (
            empty($data['full_name']) ||
            empty($data['email']) ||
            empty($data['password']) ||
            empty($data['address']) ||
            empty($data['birth_date'])
        ) {
            json_response(['error' => 'Missing required fields'], 400);
        }

        // Hash password
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);

        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO users 
            (full_name, email, password, role, address, birth_date, phone, barangay_id, id_photo_url, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', NOW())
        ");

        try {
            $stmt->execute([
                $data['full_name'],
                $data['email'],
                $hashed,
                $data['role'] ?? 'resident',
                $data['address'],
                $data['birth_date'],
                $data['phone'] ?? null,
                $data['barangay_id'] ?? null,
                $data['id_photo_url'] ?? null
            ]);
        } catch (PDOException $e) {
            // Duplicate email
            if ($e->errorInfo[1] === 1062) {
                json_response(['error' => 'Email already exists'], 409);
            }
            throw $e;
        }

        json_response(['message' => 'Registration successful'], 201);
    }

    // -------------------------------
    // LIST ALL USERS (GET /users)
    // -------------------------------
    public static function list(): void
    {
        $admin = require_auth('admin');
        require_method('GET');

        $pdo = Database::get();
        $stmt = $pdo->query('
            SELECT id, role, full_name, email, phone, address, status, created_at 
            FROM users 
            ORDER BY created_at DESC
        ');
        json_response(['users' => $stmt->fetchAll()]);
    }

    // -------------------------------
    // GET USER BY ID (GET /users/:id)
    // -------------------------------
    public static function get(int $id): void
    {
        $admin = require_auth('admin');
        require_method('GET');

        $pdo = Database::get();
        $stmt = $pdo->prepare('
            SELECT id, role, full_name, email, phone, address, status, created_at 
            FROM users 
            WHERE id = ? LIMIT 1
        ');

        $stmt->execute([$id]);
        $user = $stmt->fetch();

        if (!$user) {
            json_response(['error' => 'Not Found'], 404);
        }

        json_response(['user' => $user]);
    }

    // -------------------------------
    // DELETE USER (DELETE /users/:id)
    // -------------------------------
    public static function delete(int $id): void
    {
        $admin = require_auth('admin');
        require_method('DELETE');

        $pdo = Database::get();
        $stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');

        try {
            $stmt->execute([$id]);
        } catch (PDOException $e) {
            // Foreign key constraint error (user has related records)
            if ($e->errorInfo[1] === 1451) {
                json_response(['error' => 'Cannot delete user with related records'], 409);
            }
            throw $e;
        }

        if ($stmt->rowCount() === 0) {
            json_response(['error' => 'User not found'], 404);
        }

        json_response(['message' => 'User deleted']);
    }
}
