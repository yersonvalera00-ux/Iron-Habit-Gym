<?php
/**
 * SERVICIO: SOCIOS (requiere sesión activa)
 * GET    /api/socios.php              lista (soporta ?pagina=&limite=)
 * GET    /api/socios.php?id=5         un socio
 * POST   /api/socios.php              crea   { nombre_completo, telefono, email, membresia, fecha_ingreso, estado, peso, estatura, grasa, musculo, antecedentes }
 * PUT    /api/socios.php?id=5         actualiza (mismos campos)
 * DELETE /api/socios.php?id=5         elimina
 */
require_once __DIR__ . "/../conexion.php";
require_once __DIR__ . "/core/Response.php";
require_once __DIR__ . "/core/Auth.php";

header("Access-Control-Allow-Origin: http://localhost:8000");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");

Auth::requerirSesion(); // corta con 401 si no hay sesión

$metodo = $_SERVER["REQUEST_METHOD"];
$id = isset($_GET["id"]) ? (int) $_GET["id"] : null;
$body = json_decode(file_get_contents("php://input"), true) ?? [];

switch ($metodo) {

    case "GET":
        if ($id) {
            $stmt = mysqli_prepare($conexion, "SELECT * FROM socios WHERE id_socio = ?");
            mysqli_stmt_bind_param($stmt, "i", $id);
            mysqli_stmt_execute($stmt);
            $socio = mysqli_stmt_get_result($stmt)->fetch_assoc();
            if (!$socio) Response::error("Socio no encontrado.", 404);
            Response::exito($socio);
        }

        // Paginación básica (rendimiento: evita traer toda la tabla)
        $limite = min(max((int) ($_GET["limite"] ?? 20), 1), 100);
        $pagina = max((int) ($_GET["pagina"] ?? 1), 1);
        $offset = ($pagina - 1) * $limite;

        $stmt = mysqli_prepare($conexion, "SELECT * FROM socios ORDER BY id_socio DESC LIMIT ? OFFSET ?");
        mysqli_stmt_bind_param($stmt, "ii", $limite, $offset);
        mysqli_stmt_execute($stmt);
        $lista = mysqli_stmt_get_result($stmt)->fetch_all(MYSQLI_ASSOC);

        $total = mysqli_fetch_assoc(mysqli_query($conexion, "SELECT COUNT(*) AS t FROM socios"))["t"];
        Response::exito(["socios" => $lista, "total" => (int) $total, "pagina" => $pagina, "limite" => $limite]);
        break;

    case "POST":
        $nombre = trim($body["nombre_completo"] ?? "");
        $email = trim($body["email"] ?? "");
        if ($nombre === "" || $email === "") Response::error("nombre_completo y email son obligatorios.", 422);

        $stmt = mysqli_prepare($conexion,
            "INSERT INTO socios (nombre_completo, telefono, email, membresia, fecha_ingreso, estado, peso, estatura, grasa, musculo, antecedentes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $telefono = $body["telefono"] ?? "";
        $membresia = $body["membresia"] ?? "m1";
        $fecha = $body["fecha_ingreso"] ?? date("Y-m-d");
        $estado = $body["estado"] ?? "Pendiente";
        $peso = $body["peso"] ?? null;
        $estatura = $body["estatura"] ?? null;
        $grasa = $body["grasa"] ?? null;
        $musculo = $body["musculo"] ?? null;
        $antecedentes = $body["antecedentes"] ?? "";

        // orden: nombre, telefono, email, membresia, fecha, estado (6 s) | peso, estatura, grasa, musculo (4 d) | antecedentes (1 s)
        mysqli_stmt_bind_param($stmt, "ssssssdddds",
            $nombre, $telefono, $email, $membresia, $fecha, $estado, $peso, $estatura, $grasa, $musculo, $antecedentes);
        mysqli_stmt_execute($stmt);

        Response::exito(["id" => mysqli_insert_id($conexion)], "Socio registrado correctamente.", 201);
        break;

    case "PUT":
        if (!$id) Response::error("Falta ?id=", 422);
        $campos = ["nombre_completo", "telefono", "email", "membresia", "fecha_ingreso", "estado", "peso", "estatura", "grasa", "musculo", "antecedentes"];
        $sets = []; $valores = []; $tipos = "";
        foreach ($campos as $c) {
            if (array_key_exists($c, $body)) {
                $sets[] = "$c = ?";
                $valores[] = $body[$c];
                $tipos .= "s";
            }
        }
        if (!$sets) Response::error("No se enviaron campos para actualizar.", 422);

        $valores[] = $id; $tipos .= "i";
        $sql = "UPDATE socios SET " . implode(", ", $sets) . " WHERE id_socio = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, $tipos, ...$valores);
        mysqli_stmt_execute($stmt);

        if (mysqli_stmt_affected_rows($stmt) === 0) Response::error("Socio no encontrado o sin cambios.", 404);
        Response::exito(null, "Socio actualizado correctamente.");
        break;

    case "DELETE":
        if (!$id) Response::error("Falta ?id=", 422);
        $stmt = mysqli_prepare($conexion, "DELETE FROM socios WHERE id_socio = ?");
        mysqli_stmt_bind_param($stmt, "i", $id);
        mysqli_stmt_execute($stmt);
        if (mysqli_stmt_affected_rows($stmt) === 0) Response::error("Socio no encontrado.", 404);
        Response::exito(null, "Socio eliminado correctamente.");
        break;

    default:
        Response::error("Método no soportado.", 405);
}
