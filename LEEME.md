# Iron Habit Gym — Estructura Reorganizada

## Cómo probarlo
Este proyecto usa `fetch()`, por lo que **no funciona abriendo el HTML con doble clic**
(el navegador bloquea esas peticiones sobre `file://`). Sírvelo con cualquier servidor local:

```bash
# Opción PHP (la que ya usas)
php -S localhost:8000

# Opción Node
npx http-server -p 8000
```

Luego abre `http://localhost:8000/index.html`.

## Estructura de archivos

```
index.html              → Landing page pública (sin login)
login.html               → Pantalla de acceso — RECARGA REAL del navegador
dashboard.html           → Shell del panel administrativo (sidebar + topbar)
style.css                → Mismo diseño de siempre + estilos nuevos al final
  (toasts, validación de formularios, indicador de autoguardado, loader)

sections/                → Fragmentos HTML que se piden por fetch() según la pestaña
  kpis.html
  socios.html
  mensualidades.html
  rutinas.html
  estadisticas.html
  configuracion.html

js/
  storage.js              → "Base de datos" simulada (localStorage) + consola SQL pedagógica
  common.js                → Tema claro/oscuro, toasts, validación, autoguardado, guardas de sesión
  landing.js               → Lógica exclusiva de index.html
  login.js                 → Lógica exclusiva de login.html
  dashboard.js              → Shell del dashboard: cargador maestro (fetch) + History API
  sections/
    kpis.js, socios.js, mensualidades.js, rutinas.js, estadisticas.js, configuracion.js
    → Lógica propia de cada pestaña. Cada uno expone una función initTabX()
      que dashboard.js ejecuta justo después de insertar su HTML.
```

## Qué cambió respecto a la versión anterior

1. **Documentos HTML reales con recarga.** `index.html`, `login.html` y `dashboard.html`
   ahora son tres páginas distintas. Antes todo vivía en un único archivo y se
   mostraba/ocultaba con `display:none`. El botón "Acceso Admin" y "Cerrar Sesión"
   navegan de verdad (`window.location.href`), como pediste para el login.

2. **Carga asíncrona por pestaña (fetch).** Al hacer clic en el menú del dashboard,
   `dashboard.js` pide con `fetch()` solo el fragmento de esa pestaña
   (`sections/socios.html`, etc.), limpia el contenedor (`innerHTML = ''`) y
   renderiza el nuevo contenido. Ya no se cargan las 6 pestañas de una vez.

3. **History API.** Cada cambio de pestaña hace `history.pushState()` con
   `?tab=nombre` en la URL. Los botones Atrás/Adelante del navegador funcionan
   y recargar la página respeta la pestaña en la que estabas.

4. **localStorage / sessionStorage para configuraciones pequeñas.**
   - Modo oscuro (ya existía, se mantuvo igual) → `localStorage`.
   - Borrador del formulario de Socios, Pagos y Rutinas → `sessionStorage`,
     con autoguardado mientras escribes y restauración si refrescas sin querer.
   - El correo del login (nunca la contraseña) también se recuerda igual.

5. **Formularios mejorados** (pediste priorizar esto):
   - Validación visible: el campo se marca en rojo y aparece un mensaje claro
     debajo, en vez de que el navegador simplemente no deje enviar.
   - Los `alert()`/`confirm()` se reemplazaron por notificaciones tipo *toast*
     y un modal de confirmación propio, con la misma paleta de la marca.
   - Indicador de "Borrador guardado" en el formulario de Socios.

6. **Nada del prototipo visual cambió.** `style.css` conserva absolutamente
   todas las reglas originales; solo se añadieron clases nuevas al final del
   archivo para los toasts, la validación y el loader.

## Encuesta / siguientes pasos sugeridos
Ya prioricé lo que pediste (páginas reales + mejora de formularios). Si quieres,
en una siguiente vuelta puedo:
- Añadir un loader esqueleto (skeleton) en vez del spinner simple.
- Migrar `alert`/`confirm` restantes de otras vistas si detectas alguno que se me escapó.
- Documentar este cambio como evidencia (EV09) con capturas y mapeo a la rúbrica del SENA.
