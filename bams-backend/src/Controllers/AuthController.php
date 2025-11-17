<?php
declare(strict_types=1);

final class AuthController
{
    public static function register(): void
    {
        require_method('POST');
        $pdo = Database::get();
        $data = body_json();

        $full_name = trim($data['full_name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');
        $role = $data['role'] ?? 'resident';

        if ($full_name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 6) {
            json_response(['error' => 'Invalid input'], 422);
        }

        // Normalize role; only 'admin' and 'resident' allowed; default to 'resident'
        if ($role !== 'admin') $role = 'resident';

        $stmt = $pdo->prepare('INSERT INTO users (role, full_name, email, password_hash) VALUES (?, ?, ?, ?)');
        try {
            $stmt->execute([$role, $full_name, $email, password_hash($password, PASSWORD_DEFAULT)]);
        } catch (PDOException $e) {
            if ($e->errorInfo[1] === 1062) json_response(['error' => 'Email already in use'], 409);
            throw $e;
        }

        json_response(['message' => 'Registered successfully']);
    }

    public static function login(): void
    {
        require_method('POST');
        $pdo = Database::get();
        $data = body_json();
        $email = strtolower(trim($data['email'] ?? ''));
        $password = (string)($data['password'] ?? '');

        $stmt = $pdo->prepare('SELECT id, role, full_name, email, password_hash, status FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user || $user['status'] !== 'active' || !password_verify($password, $user['password_hash'])) {
            json_response(['error' => 'Invalid credentials'], 401);
        }

        unset($user['password_hash']);
        $_SESSION['user'] = $user;
        json_response(['user' => $user]);
    }

    public static function me(): void
    {
        require_method('GET');
        $u = current_user();
        if (!$u) json_response(['user' => null]);
        json_response(['user' => $u]);
    }

    public static function logout(): void
    {
        require_method('POST');
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        json_response(['message' => 'Logged out']);
    }

}
