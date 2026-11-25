<?php
/**
 * Formato de respuesta único para toda la API:
 * { "exito": bool, "datos": mixed, "mensaje": string }
 */
class Response {
    public static function json(array $payload, int $httpCode = 200): void {
        http_response_code($httpCode);
        header("Content-Type: application/json; charset=utf-8");
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    public static function exito($datos = null, string $mensaje = "OK", int $codigo = 200): void {
        self::json(["exito" => true, "datos" => $datos, "mensaje" => $mensaje], $codigo);
    }

    public static function error(string $mensaje, int $codigo = 400): void {
        self::json(["exito" => false, "datos" => null, "mensaje" => $mensaje], $codigo);
    }
}
