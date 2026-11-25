<?php
require_once __DIR__ . "/Response.php";

class Auth {
    /** Corta la petición con 401 si no hay sesión activa */
    public static function requerirSesion(): array {
        if (session_status() === PHP_SESSION_NONE) session_start();
        if (empty($_SESSION["usuario_id"])) {
            Response::error("No autenticado. Inicia sesión primero.", 401);
        }
        return [
            "id" => $_SESSION["usuario_id"],
            "nombre" => $_SESSION["usuario_nombre"] ?? "",
            "email" => $_SESSION["usuario_email"] ?? ""
        ];
    }
}
