<?php
// =============================================================
// CALLBACK GOOGLE OAUTH 2.0 — Iron Habit Gym
// Procesa el código de autorización, consulta el perfil de Google,
// valida o registra el usuario en MySQL y sincroniza la sesión.
// =============================================================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/conexion.php';

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// 1. Manejo de error si el usuario canceló el acceso en Google
if (isset($_GET['error'])) {
    $error = urlencode($_GET['error']);
    header("Location: login.html?error=cancelled&detail={$error}");
    exit;
}

// 2. Validación del parámetro anti-CSRF (state)
if (empty($_GET['state']) || empty($_SESSION['oauth2_state']) || !hash_equals($_SESSION['oauth2_state'], $_GET['state'])) {
    unset($_SESSION['oauth2_state']);
    header("Location: login.html?error=invalid_state");
    exit;
}

// Limpiar el estado usado
unset($_SESSION['oauth2_state']);

// 3. Validar presencia del código de autorización
if (empty($_GET['code'])) {
    header("Location: login.html?error=no_code");
    exit;
}

$code = $_GET['code'];

// 4. Intercambiar el código por tokens en Google OAuth Token Endpoint
$tokenEndpoint = 'https://oauth2.googleapis.com/token';
$postData = [
    'code'          => $code,
    'client_id'     => GOOGLE_CLIENT_ID,
    'client_secret' => GOOGLE_CLIENT_SECRET,
    'redirect_uri'  => GOOGLE_REDIRECT_URI,
    'grant_type'    => 'authorization_code'
];

$ch = curl_init($tokenEndpoint);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$tokenResponse = curl_exec($ch);
$curlError = curl_error($ch);
$httpStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlError || $httpStatus !== 200) {
    error_log("Google OAuth Token Error: HTTP {$httpStatus} - {$curlError} - {$tokenResponse}");
    header("Location: login.html?error=token_exchange_failed");
    exit;
}

$tokenData = json_decode($tokenResponse, true);
if (empty($tokenData['access_token'])) {
    header("Location: login.html?error=missing_token");
    exit;
}

$accessToken = $tokenData['access_token'];

// 5. Consultar información de perfil del usuario con el token de acceso
$userInfoEndpoint = 'https://www.googleapis.com/oauth2/v3/userinfo';

$ch = curl_init($userInfoEndpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $accessToken,
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);

$userInfoResponse = curl_exec($ch);
$curlUserError = curl_error($ch);
$httpUserStatus = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($curlUserError || $httpUserStatus !== 200) {
    error_log("Google OAuth UserInfo Error: HTTP {$httpUserStatus} - {$curlUserError} - {$userInfoResponse}");
    header("Location: login.html?error=userinfo_failed");
    exit;
}

$userData = json_decode($userInfoResponse, true);

if (empty($userData['email'])) {
    header("Location: login.html?error=missing_email");
    exit;
}

// Datos proporcionados por Google
$googleId = $userData['sub'] ?? '';
$email    = strtolower(trim($userData['email']));
$nombre   = trim($userData['name'] ?? ($userData['given_name'] ?? 'Usuario Google'));
$avatar   = $userData['picture'] ?? '';

// 6. Asegurar existencia de la tabla usuarios en la base de datos
$sqlCreateTable = "CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    avatar VARCHAR(500) NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Administrador',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
mysqli_query($conexion, $sqlCreateTable);

// 7. Buscar si el usuario ya existe en la base de datos
$stmt = mysqli_prepare($conexion, "SELECT id, google_id, nombre, email, avatar, rol, estado FROM usuarios WHERE email = ? LIMIT 1");
mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$usuarioExistente = mysqli_fetch_assoc($result);
mysqli_stmt_close($stmt);

$usuarioFinal = null;

if ($usuarioExistente) {
    // 8a. Si el usuario ya existe:
    // Validar estado de la cuenta
    if (strtolower($usuarioExistente['estado']) !== 'activo') {
        header("Location: login.html?error=cuenta_inactiva");
        exit;
    }

    // Actualizar google_id o avatar si es necesario
    $stmtUpdate = mysqli_prepare($conexion, "UPDATE usuarios SET google_id = COALESCE(NULLIF(google_id, ''), ?), avatar = ?, actualizado_en = NOW() WHERE id = ?");
    mysqli_stmt_bind_param($stmtUpdate, "ssi", $googleId, $avatar, $usuarioExistente['id']);
    mysqli_stmt_execute($stmtUpdate);
    mysqli_stmt_close($stmtUpdate);

    $usuarioFinal = [
        'id'        => (string)$usuarioExistente['id'],
        'google_id' => $googleId,
        'nombre'    => $usuarioExistente['nombre'],
        'email'     => $usuarioExistente['email'],
        'avatar'    => $avatar ?: $usuarioExistente['avatar'],
        'rol'       => $usuarioExistente['rol'] ?: 'Administrador',
        'estado'    => $usuarioExistente['estado']
    ];

} else {
    // 8b. Si el usuario no existe: crearlo automáticamente
    $estadoInicial = 'Activo';
    $rolInicial    = 'Administrador';

    $stmtInsert = mysqli_prepare($conexion, "INSERT INTO usuarios (google_id, nombre, email, avatar, rol, estado) VALUES (?, ?, ?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmtInsert, "ssssss", $googleId, $nombre, $email, $avatar, $rolInicial, $estadoInicial);
    
    if (mysqli_stmt_execute($stmtInsert)) {
        $nuevoId = mysqli_insert_id($conexion);
        $usuarioFinal = [
            'id'        => (string)$nuevoId,
            'google_id' => $googleId,
            'nombre'    => $nombre,
            'email'     => $email,
            'avatar'    => $avatar,
            'rol'       => $rolInicial,
            'estado'    => $estadoInicial
        ];
    } else {
        error_log("Error registrando nuevo usuario con Google: " . mysqli_error($conexion));
        header("Location: login.html?error=db_error");
        exit;
    }
    mysqli_stmt_close($stmtInsert);
}

// 9. Guardar sesión en el backend (PHP Session)
$_SESSION['is_logged_in'] = true;
$_SESSION['active_user']  = $usuarioFinal;

// 10. Renderizar pantalla de enlace y sincronización con localStorage
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iniciando sesión — Iron Habit Gym</title>
  <link rel="icon" type="image/png" href="logo-icon-favicon.png">
  <link rel="stylesheet" href="style.css">
  <style>
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: radial-gradient(circle at 50% 30%, #20053b 0%, #0d0118 100%);
      color: #ffffff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
    }
    .auth-loader-card {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(12px);
      border-radius: 16px;
      padding: 2.5rem 2rem;
      text-align: center;
      max-width: 380px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    }
    .auth-spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(191, 131, 252, 0.2);
      border-top-color: #bf83fc;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem auto;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .auth-title {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #ffffff;
    }
    .auth-sub {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.7);
    }
  </style>
</head>
<body>
  <div class="auth-loader-card">
    <div class="auth-spinner"></div>
    <div class="auth-title">Autenticación exitosa</div>
    <div class="auth-sub">Conectando con tu panel de Iron Habit Gym...</div>
  </div>

  <script>
    // Sincronización transparente con el frontend de Iron Habit Gym
    const usuario = <?php echo json_encode($usuarioFinal, JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_AMP | JSON_UNESCAPED_UNICODE); ?>;

    try {
      localStorage.setItem("is_logged_in", "true");
      localStorage.setItem("active_user", JSON.stringify(usuario));

      // Sincronizar también con la lista de administradores local
      let listaAdmin = JSON.parse(localStorage.getItem("admin_datos")) || [];
      const indice = listaAdmin.findIndex(a => a.email && a.email.toLowerCase() === usuario.email.toLowerCase());
      
      if (indice >= 0) {
        listaAdmin[indice] = Object.assign({}, listaAdmin[indice], usuario);
      } else {
        listaAdmin.push(usuario);
      }
      localStorage.setItem("admin_datos", JSON.stringify(listaAdmin));

      // Limpiar borradores residuales de login si existían
      sessionStorage.removeItem("draft_login_form");
    } catch (e) {
      console.warn("Advertencia al sincronizar localStorage:", e);
    }

    // Redirigir de inmediato al Dashboard
    setTimeout(function() {
      window.location.href = "dashboard.html";
    }, 450);
  </script>
</body>
</html>
