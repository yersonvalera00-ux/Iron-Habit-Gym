<?php
// POST /api/login.php  { "email", "password" }
require_once __DIR__ . '/helpers.php';
exigirPost();

$d        = leerJson();
$email    = strtolower(trim($d['email'] ?? ''));
$password = (string)($d['password'] ?? '');

if ($email === '' || $password === '') {
    responder(400, false, 'Correo y contraseña son obligatorios.');
}

// Búsqueda con sentencia preparada
$stmt = mysqli_prepare($conexion,
    "SELECT id, nombre, email, password_hash, rol, estado FROM usuarios WHERE email = ? LIMIT 1");
if (!$stmt) {
    responder(500, false, 'Error interno del servidor.');
}
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$resultado = mysqli_stmt_get_result($stmt);
$u = $resultado ? mysqli_fetch_assoc($resultado) : null;

// Se verifica siempre contra un hash (real o falso) para igualar tiempos de respuesta y mitigar ataques de temporización
$hash = ($u && !empty($u['password_hash'])) ? $u['password_hash'] : password_hash('dummy', PASSWORD_DEFAULT);
$ok   = password_verify($password, $hash) && $u && strtolower($u['estado']) === 'activo';

if (!$ok) {
    // Mensaje genérico: no revela si falló el correo o la contraseña
    responder(401, false, 'Error en la autenticación.');
}

// Sesión segura
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => false, // En entorno local HTTP sin SSL
        'httponly' => true,
        'samesite' => 'Lax'
    ]);
    session_start();
}
session_regenerate_id(true);
$_SESSION['usuario'] = [
    'id'     => $u['id'],
    'nombre' => $u['nombre'],
    'rol'    => $u['rol']
];

responder(200, true, 'Autenticación satisfactoria.', [
    'usuario' => [
        'id'     => $u['id'],
        'nombre' => $u['nombre'],
        'email'  => $u['email'],
        'rol'    => $u['rol']
    ]
]);
