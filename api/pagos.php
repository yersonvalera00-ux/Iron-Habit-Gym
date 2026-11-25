<?php
/**
 * SERVICIO: PAGOS / MENSUALIDADES (requiere sesión activa)
 * GET    /api/pagos.php                   lista (soporta ?socio_id=)
 * POST   /api/pagos.php                   crea  { socio_id, monto, metodo, fecha_pago }
 *                                          → activa automáticamente el estado del socio
 * DELETE /api/pagos.php?id=5              anula un pago
 */
require_once __DIR__ . "/../conexion.php";
require_once __DIR__ . "/core/Response.php";
require_once __DIR__ . "/core/Auth.php";

header("Access-Control-Allow-Origin: http://localhost:8000");
header("Access-Control-Allow-Methods: GET, POST, DELETE");

Auth::requerirSesion();

$metodo = $_SERVER["REQUEST_METHOD"];
$id = isset($_GET["id"]) ? (int) $_GET["id"] : null;
$body = json_decode(file_get_contents("php://input"), true) ?? [];

switch ($metodo) {

    case "GET":
        $sql = "SELECT p.*, s.nombre_completo FROM pagos p JOIN socios s ON s.id_socio = p.socio_id";
        $params = []; $tipos = "";
        if (!empty($_GET["socio_id"])) {
            $sql .= " WHERE p.socio_id = ?";
            $params[] = (int) $_GET["socio_id"];
            $tipos = "i";
        }
        $sql .= " ORDER BY p.id DESC";
        $stmt = mysqli_prepare($conexion, $sql);
        if ($params) mysqli_stmt_bind_param($stmt, $tipos, ...$params);
        mysqli_stmt_execute($stmt);
        Response::exito(mysqli_stmt_get_result($stmt)->fetch_all(MYSQLI_ASSOC));
        break;

    case "POST":
        $socioId = (int) ($body["socio_id"] ?? 0);
        $monto = (int) ($body["monto"] ?? 0);
        $metodoPago = trim($body["metodo"] ?? "");
        $fecha = $body["fecha_pago"] ?? date("Y-m-d");

        if ($socioId <= 0 || $monto <= 0 || $metodoPago === "") {
            Response::error("socio_id, monto (>0) y metodo son obligatorios.", 422);
        }

        // Transacción: el pago y la activación del socio deben ocurrir juntos
        mysqli_begin_transaction($conexion);
        try {
            $stmt = mysqli_prepare($conexion,
                "INSERT INTO pagos (socio_id, monto, metodo, fecha_pago) VALUES (?, ?, ?, ?)");
            mysqli_stmt_bind_param($stmt, "iiss", $socioId, $monto, $metodoPago, $fecha);
            mysqli_stmt_execute($stmt);
            $nuevoId = mysqli_insert_id($conexion);

            $stmt2 = mysqli_prepare($conexion, "UPDATE socios SET estado = 'Activo' WHERE id_socio = ?");
            mysqli_stmt_bind_param($stmt2, "i", $socioId);
            mysqli_stmt_execute($stmt2);
            if (mysqli_stmt_affected_rows($stmt2) === 0 && mysqli_affected_rows($conexion) === 0) {
                throw new Exception("El socio indicado no existe.");
            }

            mysqli_commit($conexion);
            Response::exito(["id" => $nuevoId], "Pago registrado. Socio activado.", 201);
        } catch (Exception $e) {
            mysqli_rollback($conexion);
            Response::error("No se pudo registrar el pago: " . $e->getMessage(), 400);
        }
        break;

    case "DELETE":
        if (!$id) Response::error("Falta ?id=", 422);
        $stmt = mysqli_prepare($conexion, "DELETE FROM pagos WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        if (mysqli_stmt_affected_rows($stmt) === 0) Response::error("Pago no encontrado.", 404);
        Response::exito(null, "Pago anulado.");
        break;

    default:
        Response::error("Método no soportado.", 405);
}
