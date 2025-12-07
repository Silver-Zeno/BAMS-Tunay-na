<?php
declare(strict_types=1);

require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/Controllers/AuthController.php';
require_once __DIR__ . '/../src/Controllers/ServiceController.php';
require_once __DIR__ . '/../src/Controllers/AppointmentController.php';
require_once __DIR__ . '/../src/Controllers/UsersController.php';
require_once __DIR__ . '/../src/Controllers/DocumentFormatsController.php';
require_once __DIR__ . '/../src/Controllers/UploadController.php';
require_once __DIR__ . '/../src/Controllers/IssuedDocumentsController.php';

// -----------------------------------------------------
// CORS FIX (prevents "Failed to fetch")
// -----------------------------------------------------
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// -----------------------------------------------------
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';

// Adjust base if app is not root
$base = '/BAMS/bams-backend/public';

if (!function_exists('str_starts_with')) {
    function str_starts_with(string $haystack, string $needle): bool {
        return $needle !== '' && strpos($haystack, $needle) === 0;
    }
}

if (str_starts_with($path, $base)) {
    $path = substr($path, strlen($base));
}

// -----------------------------------------------------
// ROUTES
// -----------------------------------------------------
switch (true) {

    // Health check
    case $path === '/api/health':
        $ok = false;
        try {
            $pdo = Database::get();
            $pdo->query('SELECT 1');
            $ok = true;
        } catch (Throwable $e) {}
        json_response([
            'status' => $ok ? 'ok' : 'error',
            'session' => session_id() !== '' ? 'ok' : 'missing',
        ], $ok ? 200 : 500);
        break;

    // -------------------------------------------
    // REGISTER (Updated to use UsersController)
    // -------------------------------------------
    case $path === '/api/register' && $_SERVER['REQUEST_METHOD'] === 'POST':
        UsersController::register();
        break;

    // Auth
    case $path === '/api/login':
        AuthController::login();
        break;
    case $path === '/api/logout':
        AuthController::logout();
        break;
    case $path === '/api/me':
        AuthController::me();
        break;

    // Users (admin only)
    case $path === '/api/users' && $_SERVER['REQUEST_METHOD'] === 'GET':
        UsersController::list();
        break;
    case preg_match('#^/api/users/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'GET':
        UsersController::get((int)$m[1]);
        break;
    case preg_match('#^/api/users/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'DELETE':
        UsersController::delete((int)$m[1]);
        break;

    // Services
    case $path === '/api/services' && $_SERVER['REQUEST_METHOD'] === 'GET':
        ServiceController::list();
        break;
    case $path === '/api/services' && $_SERVER['REQUEST_METHOD'] === 'POST':
        ServiceController::create();
        break;

    // Appointments
    case $path === '/api/appointments' && $_SERVER['REQUEST_METHOD'] === 'GET':
        AppointmentController::list();
        break;
    case $path === '/api/appointments' && $_SERVER['REQUEST_METHOD'] === 'POST':
        AppointmentController::create();
        break;
    case preg_match('#^/api/appointments/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'GET':
        AppointmentController::get((int)$m[1]);
        break;
    case preg_match('#^/api/appointments/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'PATCH':
        AppointmentController::updateStatus((int)$m[1]);
        break;
    case preg_match('#^/api/appointments/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'DELETE':
        AppointmentController::delete((int)$m[1]);
        break;

    // Document formats
    case $path === '/api/document-formats' && $_SERVER['REQUEST_METHOD'] === 'GET':
        DocumentFormatsController::list();
        break;
    case $path === '/api/document-formats' && $_SERVER['REQUEST_METHOD'] === 'POST':
        DocumentFormatsController::create();
        break;
    case preg_match('#^/api/document-formats/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'GET':
        DocumentFormatsController::get((int)$m[1]);
        break;
    case preg_match('#^/api/document-formats/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'PATCH':
        DocumentFormatsController::update((int)$m[1]);
        break;
    case preg_match('#^/api/document-formats/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'DELETE':
        DocumentFormatsController::delete((int)$m[1]);
        break;

    // Uploads
    case $path === '/api/upload/image' && $_SERVER['REQUEST_METHOD'] === 'POST':
        UploadController::uploadImage();
        break;

    // Issued Documents
    case $path === '/api/issued-documents' && $_SERVER['REQUEST_METHOD'] === 'POST':
        IssuedDocumentsController::create();
        break;
    case preg_match('#^/api/issued-documents/(\d+)$#', $path, $m) && $_SERVER['REQUEST_METHOD'] === 'GET':
        IssuedDocumentsController::get((int)$m[1]);
        break;

    // 404 fallback
    default:
        json_response(['error' => 'Not Found', 'path' => $path], 404);
}
