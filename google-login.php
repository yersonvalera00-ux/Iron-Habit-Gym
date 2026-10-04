<?php
// =============================================================
// INICIO DE AUTENTICACIÓN GOOGLE OAUTH 2.0 — Iron Habit Gym
// Redirige al usuario a la pantalla de consentimiento de Google
// =============================================================

require_once __DIR__ . '/config.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$clientId     = trim(GOOGLE_CLIENT_ID);
$clientSecret = trim(GOOGLE_CLIENT_SECRET);
$redirectUri  = trim(GOOGLE_REDIRECT_URI);

// Generación de token anti-CSRF criptográficamente seguro
$state = bin2hex(random_bytes(16));
$_SESSION['oauth2_state'] = $state;

// Construir parámetros oficiales de autorización Google OAuth 2.0
$params = [
    'client_id'     => $clientId,
    'redirect_uri'  => $redirectUri,
    'response_type' => 'code',
    'scope'         => 'openid email profile',
    'state'         => $state,
    'access_type'   => 'online',
    'prompt'        => 'select_account'
];

$authUrl = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);

// Redirigir directamente al servidor de autenticación de Google
header('Location: ' . $authUrl);
exit;
