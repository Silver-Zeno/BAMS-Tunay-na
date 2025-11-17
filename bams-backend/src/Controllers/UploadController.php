<?php
declare(strict_types=1);

final class UploadController
{
    public static function uploadImage(): void
    {
        require_auth();
        require_method('POST');

        if (!isset($_FILES['file']) || !is_array($_FILES['file'])) {
            json_response(['error' => 'file required'], 422);
        }
        $f = $_FILES['file'];
        if (($f['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            json_response(['error' => 'upload failed'], 400);
        }
        $tmp = $f['tmp_name'];
        $name = $f['name'] ?? 'file';
        $size = (int)($f['size'] ?? 0);
        if (!is_uploaded_file($tmp)) json_response(['error' => 'invalid upload'], 400);
        if ($size <= 0 || $size > 10 * 1024 * 1024) json_response(['error' => 'file too large'], 413);

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mime = finfo_file($finfo, $tmp) ?: 'application/octet-stream';
        finfo_close($finfo);
        $allowed = ['image/png','image/jpeg','image/gif','image/svg+xml','image/webp'];
        if (!in_array($mime, $allowed, true)) {
            json_response(['error' => 'invalid file type'], 415);
        }

        $ext = pathinfo($name, PATHINFO_EXTENSION);
        if ($mime === 'image/svg+xml') { $ext = 'svg'; }
        if ($mime === 'image/png') { $ext = 'png'; }
        if ($mime === 'image/jpeg') { $ext = 'jpg'; }
        if ($mime === 'image/gif') { $ext = 'gif'; }
        if ($mime === 'image/webp') { $ext = 'webp'; }

        $destDir = realpath(__DIR__ . '/../../public');
        if ($destDir === false) json_response(['error' => 'storage missing'], 500);
        $uploads = $destDir . DIRECTORY_SEPARATOR . 'uploads';
        if (!is_dir($uploads)) @mkdir($uploads, 0775, true);
        if (!is_dir($uploads) || !is_writable($uploads)) json_response(['error' => 'storage not writable'], 500);

        $base = bin2hex(random_bytes(8));
        $filename = $base . '.' . $ext;
        $path = $uploads . DIRECTORY_SEPARATOR . $filename;
        if (!move_uploaded_file($tmp, $path)) {
            json_response(['error' => 'failed to store file'], 500);
        }

        $url = '/uploads/' . $filename;
        json_response(['url' => $url, 'mime' => $mime, 'size' => $size]);
    }
}
