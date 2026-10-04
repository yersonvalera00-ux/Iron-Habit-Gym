<?php
// =============================================================
// CONEXIÓN A BASE DE DATOS — Iron Habit Gym
// Archivo compartido por todos los scripts PHP del proyecto
// =============================================================

require_once __DIR__ . '/config.php';

$servidor   = env('DB_HOST', 'localhost');
$usuario    = env('DB_USER', 'root');   // Usuario por defecto en XAMPP
$password   = env('DB_PASS', '');       // Sin contraseña por defecto en XAMPP
$base_datos = env('DB_NAME', 'iron_habit_database');

$conexion = mysqli_connect($servidor, $usuario, $password, $base_datos);

if (!$conexion) {
    // En producción real esto no debería mostrarse al usuario
    die(json_encode([
        "exito"   => false,
        "mensaje" => "Conexión fallida: " . mysqli_connect_error()
    ]));
}

// Aseguramos que los datos se lean y guarden en UTF-8
mysqli_set_charset($conexion, "utf8");

?>