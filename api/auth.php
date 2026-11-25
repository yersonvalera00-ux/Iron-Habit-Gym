<?php
/**
 * SERVICIO: AUTENTICACIÓN
 * POST /api/auth.php?accion=registro  { nombre, email, password }
 * POST /api/auth.php?accion=login     { email, password }
 * POST /api/auth.php?accion=logout
 * GET  /api/auth.php?accion=me
 */
require_once __DIR__ . "/../conexion.php";
require_once __DIR__ . "/core/Response.php";

if (session_status() === PHP_SESSION_NONE) session_start();
header("Access-Control-Allow-Origin: http://localhost:8000"); // restringido, no "*"
header("Access-Control-Allow-Methods: GET, POST");

$accion = $_GET["accion"] ?? "";
$metodo = $_SERVER["REQUEST_METHOD"];
$body = json_decode(file_get_contents("php://input"), true) ?? [];

switch ("$metodo:$accion") {

    case "POST:registro":
        $nombre = trim($body["nombre"] ?? "");
        $email = trim($body["email"] ?? "");
        $pass = $body["password"] ?? "";

        if ($nombre === "" || $email === "" || strlen($pass) < 6) {
            Response::error("Nombre, email y contraseña (mín. 6 caracteres) son obligatorios.", 422);
        }

        $stmt = mysqli_prepare($conexion, "SELECT id FROM usuarios WHERE email = ?");
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        if (mysqli_stmt_get_result($stmt)->num_rows > 0) {
            Response::error("Ese correo ya está registrado.", 409);
        }

        $hash = password_hash($pass, PASSWORD_DEFAULT);
        $stmt = mysqli_prepare($conexion,
            "INSERT INTO usuarios (nombre, email, contrasena, rol, estado) VALUES (?, ?, ?, 'Administrador', 'Activo')");
        mysqli_stmt_bind_param($stmt, "sss", $nombre, $email, $hash);
        mysqli_stmt_execute($stmt);

        Response::exito(["id" => mysqli_insert_id($conexion)], "Usuario registrado correctamente.", 201);
        break;

    case "POST:login":
        $email = trim($body["email"] ?? "");
        $pass = $body["password"] ?? "";

        $stmt = mysqli_prepare($conexion, "SELECT id, nombre, email, contrasena, estado FROM usuarios WHERE email = ?");
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $usuario = mysqli_stmt_get_result($stmt)->fetch_assoc();

        if (!$usuario || !password_verify($pass, $usuario["contrasena"] ?? "")) {
            Response::error("Credenciales incorrectas.", 401);
        }
        if ($usuario["estado"] !== "Activo") {
            Response::error("Cuenta inactiva. Contacta al administrador.", 403);
        }

        session_regenerate_id(true);
        $_SESSION["usuario_id"] = $usuario["id"];
        $_SESSION["usuario_nombre"] = $usuario["nombre"];
        $_SESSION["usuario_email"] = $usuario["email"];

        Response::exito([
            "id" => $usuario["id"], "nombre" => $usuario["nombre"], "email" => $usuario["email"]
        ], "Autenticación exitosa.");
        break;

    case "POST:logout":
        $_SESSION = [];
        session_destroy();
        Response::exito(null, "Sesión cerrada.");
        break;

    case "GET:me":
        if (empty($_SESSION["usuario_id"])) Response::error("No autenticado.", 401);
        Response::exito([
            "id" => $_SESSION["usuario_id"],
            "nombre" => $_SESSION["usuario_nombre"],
            "email" => $_SESSION["usuario_email"]
        ]);
        break;

    default:
        Response::error("Ruta o método no soportado. Usa ?accion=registro|login|logout|me", 404);
}
