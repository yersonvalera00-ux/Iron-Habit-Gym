# Servicios Web de Autenticación — Iron Habit Gym
**Evidencia:** GA7-220501096-AA5-EV01  
**Ficha:** 3186630 — SENA CSF  
**Tecnología:** PHP 8.2 (plano) + MySQLi + MySQL / MariaDB (XAMPP)

---

## 1. Descripción del Servicio

Servicio web RESTful liviano en formato JSON para el registro e inicio de sesión seguro de usuarios en la plataforma **Iron Habit Gym**. Reemplaza la validación en el cliente (`localStorage`) por autenticación robusta del lado del servidor con almacenamiento criptográfico de contraseñas y gestión de sesiones seguras.

---

## 2. Endpoints y Códigos de Respuesta

| Endpoint | Método | Formato Entrada | Parámetros | Códigos HTTP | Descripción |
|---|---|---|---|---|---|
| `/api/registro.php` | `POST` | `application/json` | `nombre` (string, 1-150)<br>`email` (string, email)<br>`password` (string, min 8) | **201** Created<br>**400** Bad Request<br>**405** Method Not Allowed<br>**409** Conflict<br>**500** Internal Error | Registra usuario con rol `Recepcionista` y contraseña hasheada con bcrypt. |
| `/api/login.php` | `POST` | `application/json` | `email` (string)<br>`password` (string) | **200** OK<br>**400** Bad Request<br>**401** Unauthorized<br>**405** Method Not Allowed<br>**500** Internal Error | Valida credenciales, regenera ID de sesión y devuelve sesión autenticada. |

### Respuestas Estándar

- **Éxito en Login (200):**
  ```json
  {
    "exito": true,
    "mensaje": "Autenticación satisfactoria.",
    "usuario": {
      "id": 2,
      "nombre": "Yerson Valera",
      "email": "y@test.com",
      "rol": "Recepcionista"
    }
  }
  ```

- **Fallo en Login (401):**
  ```json
  {
    "exito": false,
    "mensaje": "Error en la autenticación."
  }
  ```

- **Éxito en Registro (201):**
  ```json
  {
    "exito": true,
    "mensaje": "Registro exitoso.",
    "id": 2
  }
  ```

- **Correo Ya Registrado (409):**
  ```json
  {
    "exito": false,
    "mensaje": "El correo ya está registrado."
  }
  ```

- **Datos Inválidos (400):**
  ```json
  {
    "exito": false,
    "mensaje": "La contraseña debe tener al menos 8 caracteres."
  }
  ```

- **Método Inválido (405):**
  ```json
  {
    "exito": false,
    "mensaje": "Método no permitido."
  }
  ```

---

## 3. Decisiones de Seguridad y Arquitectura

1. **Hashing Criptográfico de Contraseñas (Bcrypt):**
   - Se utiliza `password_hash($password, PASSWORD_DEFAULT)` nativo de PHP, generando hashes con salt aleatorio y factor de coste adaptativo (`$2y$`).
   - Las contraseñas **nunca** se almacenan ni se registran en texto plano.

2. **Sentencias Preparadas con MySQLi:**
   - Todas las consultas SQL (`INSERT`, `SELECT`) se ejecutan mediante sentencias parametrizadas (`mysqli_prepare` y `mysqli_stmt_bind_param`), neutralizando ataques de inyección SQL (SQLi).

3. **Mensajes Genéricos Anti-Enumeración de Usuarios:**
   - Ante credenciales erróneas, tanto para un correo inexistente como para una contraseña equivocada, se responde invariablemente `"Error en la autenticación."` con código 401. Esto previene la enumeración de correos existentes en el sistema.

4. **Mitigación de Ataques de Temporización (Timing Attacks):**
   - Cuando el correo no existe en la base de datos, se ejecuta igualmente una verificación contra un hash ficticio (`password_hash('dummy', PASSWORD_DEFAULT)`), igualando la curva de tiempo de respuesta de la CPU frente a peticiones con usuarios existentes.

5. **Regeneración de ID de Sesión:**
   - Tras validar con éxito las credenciales, se llama a `session_regenerate_id(true)` para destruir el identificador de sesión anterior y emitir uno nuevo, mitigando ataques de fijación de sesión (Session Fixation).

6. **Cookies Seguras (`HttpOnly` y `SameSite`):**
   - La cookie de sesión PHP (`PHPSESSID`) se configura con los atributos:
     - `httponly = true`: impide el acceso a la cookie desde JavaScript (protección contra XSS).
     - `samesite = 'Lax'`: protege contra ataques de falsificación de peticiones en sitios cruzados (CSRF).

7. **Principio de Menor Privilegio (Rol por Defecto):**
   - El registro público asigna automáticamente el rol `Recepcionista`. Ningún registro externo puede autoasignarse privilegios de `Administrador`.

8. **Restricción de CORS y Protección de Endpoints Sensibles:**
   - Se eliminó el encabezado inseguro `Access-Control-Allow-Origin: *` de `guardar.php`.
   - Se protege el acceso a `guardar.php` exigiendo una sesión activa (`$_SESSION['usuario']` o `$_SESSION['active_user']`), rechazando con 401 a usuarios anónimos.

9. **Prevención de XSS en Notificaciones:**
   - En el frontend (`js/common.js`), los mensajes desplegados mediante `mostrarToast` se insertan a través de `textContent` en lugar de `innerHTML`.

---

## 4. Instrucciones de Ejecución en XAMPP

1. Iniciar **Apache** y **MySQL** desde el Panel de Control de XAMPP.
2. Asegurar que el repositorio se encuentre ubicado en la ruta web:
   ```
   C:\xampp\htdocs\iron-habit\
   ```
3. Verificar que el archivo `.env` contenga los datos de conexión correspondientes:
   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_NAME=iron_habit_database
   DB_USER=root
   DB_PASS=
   ```
4. Ejecutar la migración de base de datos en la consola de MySQL o phpMyAdmin:
   ```bash
   mysql -u root iron_habit_database < db/migracion_password.sql
   ```
5. Acceder a la interfaz web a través del navegador:
   - Login: `http://localhost/iron-habit/login.html`
   - Registro: `http://localhost/iron-habit/registro.html`
   - Dashboard: `http://localhost/iron-habit/dashboard.html`
6. Consultar la batería de pruebas automatizadas con curl en `api/PRUEBAS.md`.
