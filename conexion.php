<?php
// =============================================================
// CONEXIÓN A BASE DE DATOS — Iron Habit Gym
// Archivo compartido por todos los scripts PHP del proyecto
// =============================================================

$servidor   = "localhost";
$usuario    = "root";   // Usuario por defecto en XAMPP
$password   = "";       // Sin contraseña por defecto en XAMPP
$base_datos = "iron_habit_database";

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