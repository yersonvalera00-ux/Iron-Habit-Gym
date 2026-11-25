# Pruebas del Servicio Web de Autenticación (AA5-EV01)

Este documento detalla los casos de prueba ejecutados contra los servicios web de **registro** (`api/registro.php`) e **inicio de sesión** (`api/login.php`), así como la protección del endpoint `guardar.php`.

Servidor base: `http://localhost/iron-habit/`

---

## 1. Registro Exitoso (HTTP 201 Created)

Crea un nuevo usuario en la base de datos MySQL con contraseña cifrada mediante bcrypt (`PASSWORD_DEFAULT`) y rol por defecto `Recepcionista`.

### Comando (Bash / Git Bash)
```bash
curl -i -X POST http://localhost/iron-habit/api/registro.php \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Yerson Valera","email":"y@test.com","password":"Clave1234"}'
```

### Comando (Windows CMD)
```cmd
curl.exe -i -X POST http://localhost/iron-habit/api/registro.php -H "Content-Type: application/json" -d "{\"nombre\":\"Yerson Valera\",\"email\":\"y@test.com\",\"password\":\"Clave1234\"}"
```

### Salida Obtenida
```http
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":true,"mensaje":"Registro exitoso.","id":2}
```

---

## 2. Registro con Correo Duplicado (HTTP 409 Conflict)

Garantiza la unicidad del correo electrónico (`UNIQUE KEY`) respondiendo con error controlado cuando se intenta registrar un correo ya existente.

### Comando
```bash
curl -i -X POST http://localhost/iron-habit/api/registro.php \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Yerson Valera","email":"y@test.com","password":"Clave1234"}'
```

### Salida Obtenida
```http
HTTP/1.1 409 Conflict
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":false,"mensaje":"El correo ya está registrado."}
```

---

## 3. Registro con Correo Electrónico Inválido (HTTP 400 Bad Request)

Valida en el servidor mediante `filter_var(..., FILTER_VALIDATE_EMAIL)` que el formato de correo sea válido.

### Comando
```bash
curl -i -X POST http://localhost/iron-habit/api/registro.php \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Yerson Valera","email":"correo-invalido","password":"Clave1234"}'
```

### Salida Obtenida
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":false,"mensaje":"Correo electrónico inválido."}
```

---

## 4. Registro con Contraseña Corta (HTTP 400 Bad Request)

Aplica la política de seguridad mínima de 8 caracteres para la contraseña.

### Comando
```bash
curl -i -X POST http://localhost/iron-habit/api/registro.php \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Yerson Valera","email":"nuevo@test.com","password":"123"}'
```

### Salida Obtenida
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":false,"mensaje":"La contraseña debe tener al menos 8 caracteres."}
```

---

## 5. Inicio de Sesión Satisfactorio (HTTP 200 OK)

Verifica las credenciales contra el hash bcrypt almacenado, regenera el ID de sesión para prevenir fijación de sesión y establece la cookie segura (`HttpOnly`, `SameSite=Lax`). Devuelve el mensaje estipulado en la evidencia: `"Autenticación satisfactoria."`.

### Comando
```bash
curl -i -X POST http://localhost/iron-habit/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"y@test.com","password":"Clave1234"}'
```

### Salida Obtenida
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff
Set-Cookie: PHPSESSID=glem479647snjtdtdcplp6ph42; path=/; HttpOnly; SameSite=Lax

{"exito":true,"mensaje":"Autenticación satisfactoria.","usuario":{"id":2,"nombre":"Yerson Valera","email":"y@test.com","rol":"Recepcionista"}}
```

---

## 6. Inicio de Sesión con Contraseña Incorrecta (HTTP 401 Unauthorized)

Responde con el mensaje exacto `"Error en la autenticación."` sin revelar cuál componente falló.

### Comando
```bash
curl -i -X POST http://localhost/iron-habit/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"y@test.com","password":"ClaveIncorrecta"}'
```

### Salida Obtenida
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":false,"mensaje":"Error en la autenticación."}
```

---

## 7. Inicio de Sesión con Correo Inexistente (HTTP 401 Unauthorized)

Aplica verificación contra hash ficticio para mitigar ataques de temporización (timing attacks) y responde con el mismo mensaje genérico `"Error en la autenticación."` para evitar enumeración de usuarios.

### Comando
```bash
curl -i -X POST http://localhost/iron-habit/api/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"noexiste@test.com","password":"Clave1234"}'
```

### Salida Obtenida
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":false,"mensaje":"Error en la autenticación."}
```

---

## 8. Método HTTP No Permitido en Login (HTTP 405 Method Not Allowed)

Bloquea peticiones GET, PUT, DELETE u otras distintas de POST.

### Comando
```bash
curl -i -X GET http://localhost/iron-habit/api/login.php
```

### Salida Obtenida
```http
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":false,"mensaje":"Método no permitido."}
```

---

## 9. Método HTTP No Permitido en Registro (HTTP 405 Method Not Allowed)

### Comando
```bash
curl -i -X GET http://localhost/iron-habit/api/registro.php
```

### Salida Obtenida
```http
HTTP/1.1 405 Method Not Allowed
Content-Type: application/json; charset=utf-8
X-Content-Type-Options: nosniff

{"exito":false,"mensaje":"Método no permitido."}
```

---

## 10. Protección de Endpoint Interno `guardar.php` Sin Sesión (HTTP 401 Unauthorized)

Verifica que el servicio de persistencia de socios requiera sesión PHP activa (`$_SESSION['usuario']` o `$_SESSION['active_user']`) y rechaza peticiones no autorizadas.

### Comando
```bash
curl -i -X POST http://localhost/iron-habit/guardar.php \
  -d "nombre_completo=SocioPrueba&email=socio@test.com"
```

### Salida Obtenida
```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"exito":false,"mensaje":"No autorizado."}
```

---

## 11. Verificación de Almacenamiento Seguro en MySQL (Bcrypt)

Consulta directa a la base de datos `iron_habit_database`:
```sql
SELECT id, nombre, email, password_hash, rol, estado FROM usuarios WHERE email = 'y@test.com';
```

### Registro Obtenido en MySQL
| id | nombre | email | password_hash | rol | estado |
|---|---|---|---|---|---|
| 2 | Yerson Valera | y@test.com | `$2y$10$xB05HC44rO21ujKNLe8sQe7Cnl6HOitNa8rqOR9.lZbSNAyZm/QdC` | Recepcionista | Activo |

- El prefijo `$2y$` certifica que la contraseña está procesada con el algoritmo bcrypt mediante la función nativa `password_hash()` de PHP con coste adaptativo (10 rondas por defecto).
- En ningún momento se almacena ni se expone la contraseña en texto plano.
