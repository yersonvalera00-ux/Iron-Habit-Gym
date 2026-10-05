<?php
// =============================================================
// GUARDAR SOCIO — Iron Habit Gym
// Recibe los datos del formulario de Socios (JS → fetch → aquí)
// Devuelve JSON para que el JS pueda mostrar el resultado
// =============================================================

header("Content-Type: application/json; charset=utf-8");

// Permite que el JS del mismo dominio haga fetch a este archivo
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");

include("conexion.php");

// Solo aceptamos peticiones POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["exito" => false, "mensaje" => "Método no permitido."]);
    exit;
}

// ── Leemos y saneamos los datos enviados por el formulario ──
$nombre      = trim($_POST['nombre_completo']  ?? '');
$telefono    = trim($_POST['telefono']         ?? '');
$email       = trim($_POST['email']            ?? '');
$membresia   = trim($_POST['membresia']        ?? '');
$fecha       = trim($_POST['fecha']            ?? '');
$estado      = trim($_POST['estado']           ?? 'Activo');
$peso        = $_POST['peso']        !== '' ? floatval($_POST['peso'])        : null;
$estatura    = $_POST['estatura']    !== '' ? floatval($_POST['estatura'])    : null;
$grasa       = $_POST['grasa']       !== '' ? floatval($_POST['grasa'])       : null;
$musculo     = $_POST['musculo']     !== '' ? floatval($_POST['musculo'])     : null;
$antecedentes = trim($_POST['antecedentes'] ?? '');

// ── Validación mínima del lado del servidor ──
if ($nombre === '' || $email === '') {
    echo json_encode(["exito" => false, "mensaje" => "Nombre y correo son obligatorios."]);
    exit;
}

// ── Sentencia preparada (protege contra inyección SQL) ──
$sql = "INSERT INTO socios 
        (nombre_completo, telefono, email, membresia, fecha_ingreso, estado,
         peso, estatura, grasa, musculo, antecedentes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

$stmt = mysqli_prepare($conexion, $sql);

if (!$stmt) {
    echo json_encode(["exito" => false, "mensaje" => "Error preparando consulta: " . mysqli_error($conexion)]);
    exit;
}

// s = string, d = double (decimal)
mysqli_stmt_bind_param(
    $stmt,
    "ssssssdddds",
    $nombre, $telefono, $email, $membresia, $fecha, $estado,
    $peso, $estatura, $grasa, $musculo, $antecedentes
);

if (mysqli_stmt_execute($stmt)) {
    $nuevo_id = mysqli_insert_id($conexion);
    echo json_encode([
        "exito"   => true,
        "mensaje" => "Socio registrado correctamente en la base de datos.",
        "id"      => $nuevo_id
    ]);
} else {
    echo json_encode([
        "exito"   => false,
        "mensaje" => "Error al guardar: " . mysqli_stmt_error($stmt)
    ]);
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);