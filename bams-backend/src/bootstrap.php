<?php
declare(strict_types=1);

session_start();

require_once __DIR__ . '/Database.php';

set_exception_handler(function (Throwable $e) {
    $code = $e instanceof PDOException ? 500 : 500;
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()]);
    exit;
});

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) return false;
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $message, 'at' => basename($file) . ':' . $line]);
    exit;
});

function json_response($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function require_method(string $method): void {
    if ($_SERVER['REQUEST_METHOD'] !== $method) {
        json_response(['error' => 'Method Not Allowed'], 405);
    }
}

function body_json(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '[]', true);
    return is_array($data) ? $data : [];
}

function current_user(): ?array {
    return $_SESSION['user'] ?? null;
}

function require_auth(?string $role = null): array {
    $u = current_user();
    if (!$u) json_response(['error' => 'Unauthorized'], 401);
    if ($role && $u['role'] !== $role) json_response(['error' => 'Forbidden'], 403);
    return $u;
}

function reference_no(): string {
    return strtoupper(bin2hex(random_bytes(4)));
}
