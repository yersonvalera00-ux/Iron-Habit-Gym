<?php
// POST /api/registro.php  { "nombre", "email", "password" }
require_once __DIR__ . '/helpers.php';
exigirPost();

$d        = leerJson();
$nombre   = trim($d['nombre']   ?? '');
$email    = strtolower(trim($d['email'] ?? ''));
$password = (string)($d['password'] ?? '');

// --- Validaciones de servidor (nunca confiar en el cliente) ---
if ($nombre === '' || mb_strlen($nombre) > 150) {
    responder(400, false, 'Nombre obligatorio (máx. 150 caracteres).');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(400, false, 'Correo electrónico inválido.');
}
if (strlen($password) < 8) {
    responder(400, false, 'La contraseña debe tener al menos 8 caracteres.');
}

// Hash seguro: nunca se almacena la contraseña en texto plano
$hash = password_hash($password, PASSWORD_DEFAULT);
$rol  = 'Recepcionista'; // El registro público NO puede crear administradores

try {
    $stmt = mysqli_prepare($conexion,
        "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        throw new mysqli_sql_exception(mysqli_error($conexion), mysqli_errno($conexion));
    }
    mysqli_stmt_bind_param($stmt, "ssss", $nombre, $email, $hash, $rol);
    mysqli_stmt_execute($stmt);
    responder(201, true, 'Registro exitoso.', ['id' => mysqli_insert_id($conexion)]);
} catch (mysqli_sql_exception $e) {
    // 1062 = violación del índice UNIQUE de email
    if ($e->getCode() === 1062) {
        responder(409, false, 'El correo ya está registrado.');
    }
    error_log('Registro: ' . $e->getMessage());
    responder(500, false, 'Error interno del servidor.');
}
