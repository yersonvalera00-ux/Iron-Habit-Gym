<?php
// =============================================================
// CONFIGURACIÓN Y CARGADOR DE VARIABLES DE ENTORNO
// Iron Habit Gym — Google OAuth & Base de Datos
// =============================================================

if (!function_exists('cargarEnv')) {
    function cargarEnv($ruta) {
        if (!file_exists($ruta)) {
            return false;
        }

        $lineas = file($ruta, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lineas as $linea) {
            $linea = trim($linea);
            // Ignorar comentarios
            if ($linea === '' || $linea[0] === '#' || $linea[0] === ';') {
                continue;
            }

            // Separar clave y valor en el primer '='
            $partes = explode('=', $linea, 2);
            if (count($partes) === 2) {
                $clave = trim($partes[0]);
                $valor = trim($partes[1]);

                // Remover comillas simples o dobles envolventes si las hay
                if ((str_starts_with($valor, '"') && str_ends_with($valor, '"')) ||
                    (str_starts_with($valor, "'") && str_ends_with($valor, "'"))) {
                    $valor = substr($valor, 1, -1);
                }

                $_ENV[$clave] = $valor;
                $_SERVER[$clave] = $valor;
                putenv("{$clave}={$valor}");
            }
        }
        return true;
    }
}

// Cargar el archivo .env ubicado en la raíz del proyecto
cargarEnv(__DIR__ . '/.env');

if (!function_exists('env')) {
    /**
     * Obtiene el valor de una variable de entorno con valor de reserva opcional.
     *
     * @param string $clave
     * @param mixed $porDefecto
     * @return mixed
     */
    function env($clave, $porDefecto = null) {
        $valor = getenv($clave);
        if ($valor === false) {
            $valor = $_ENV[$clave] ?? $_SERVER[$clave] ?? $porDefecto;
        }
        return $valor;
    }
}

// Constantes de Google OAuth
if (!defined('GOOGLE_CLIENT_ID')) {
    define('GOOGLE_CLIENT_ID', env('GOOGLE_CLIENT_ID', ''));
}
if (!defined('GOOGLE_CLIENT_SECRET')) {
    define('GOOGLE_CLIENT_SECRET', env('GOOGLE_CLIENT_SECRET', ''));
}
if (!defined('GOOGLE_REDIRECT_URI')) {
    define('GOOGLE_REDIRECT_URI', env('GOOGLE_REDIRECT_URI', 'http://localhost/iron-habit/google-callback.php'));
}
