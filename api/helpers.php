<?php
// Utilidades compartidas por los servicios web de autenticación.
require_once __DIR__ . '/../conexion.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

/** Envía una respuesta JSON estandarizada y termina la ejecución. */
function responder(int $codigo, bool $exito, string $mensaje, array $extra = []): never {
    http_response_code($codigo);
    echo json_encode(array_merge(['exito' => $exito, 'mensaje' => $mensaje], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

/** Solo se aceptan peticiones POST. */
function exigirPost(): void {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        responder(405, false, 'Método no permitido.');
    }
}

/** Lee el cuerpo JSON de la petición (o devuelve arreglo vacío). */
function leerJson(): array {
    $datos = json_decode(file_get_contents('php://input'), true);
    return is_array($datos) ? $datos : [];
}
