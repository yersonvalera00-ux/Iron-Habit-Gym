<?php
include("conexion.php");

// Intentamos hacer una consulta simple
$sql = "SELECT * FROM socios";
$resultado = $conexion->query($sql);

if ($resultado) {
    echo "¡La conexión a la base de datos funciona perfectamente y la tabla socios está lista!";
} else {
    echo "Hubo un problema al consultar la tabla: " . $conexion->error;
}
?>