<?php
// este archivo verifica que el usuario tenga sesion ativa antes de acceder

function exigirSesion(): void{
  if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
      'lifetime' => 0,
      'path'     => '/',
      'httponly' => true,
      'samesite' => 'Lax'
    ]);
    session_start();
  }
}

if (empty($_SESSION['usuario'])) {
  http_response_code(401);
  echo json_encode([
    'exito'     => false,
    'mensaje'   => 'No autorizado.Inicia sesion primero.'
  ], JSON_UNESCAPED_UNICODE);
  exit;
}

// Devuelve los datos del usuario en sesion.

function usuarioEnSesion(): array{
  return $_SESSION['usuario'];
}