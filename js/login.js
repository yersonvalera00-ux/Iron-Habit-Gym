/**
 * ==========================================================================
 * LÓGICA DE LA PÁGINA DE LOGIN — login.html
 * Iron Habit Gym · Ficha 3186630
 * ==========================================================================
 */

const AUTOSAVE_KEY_LOGIN = "draft_login_form";

document.addEventListener("DOMContentLoaded", () => {
  // Si ya existe sesión activa, redirigir al dashboard
  if (typeof redirigirSiYaHaySesion === "function" && redirigirSiYaHaySesion()) return;

  const form = document.getElementById("form-login-principal");
  if (!form) return;

  // Restaurar y activar autoguardado de borrador (excepto contraseñas)
  if (typeof restaurarAutosave === "function") restaurarAutosave(form, AUTOSAVE_KEY_LOGIN);
  if (typeof activarAutosave === "function") activarAutosave(form, AUTOSAVE_KEY_LOGIN, ["login-password"]);
  if (typeof activarLimpiezaDeErroresEnVivo === "function") activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", handleLoginSubmit);

  // Configurar botones accesibles de visibilidad de contraseña
  configurarBotonesOjo(form);

  // Asegurar que el botón de Google redirija adecuadamente
  configurarBotonGoogle();

  // Procesar respuestas y errores provenientes de Google OAuth
  verificarParametrosOAuth();
});

/**
 * Valida la navegación del botón de Google OAuth
 */
function configurarBotonGoogle() {
  const btnGoogle = document.getElementById("btn-google-login");
  if (!btnGoogle) return;

  btnGoogle.addEventListener("click", (e) => {
    if (window.location.protocol === "file:") {
      e.preventDefault();
      mostrarToast("Debes abrir el sistema desde XAMPP (http://localhost/iron-habit/login.html) para que PHP y Google funcionen.", "warning");
    }
  });
}

/**
 * Notifica al usuario en caso de recibir errores o cancelaciones desde Google OAuth
 */
function verificarParametrosOAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");
  if (!error) return;

  const mensajesError = {
    cancelled: { msg: "Inicio de sesión con Google cancelado.", tipo: "info" },
    invalid_state: { msg: "La sesión de autorización expiró o no es válida. Intenta de nuevo.", tipo: "warning" },
    no_code: { msg: "No se recibió el código de autorización desde Google.", tipo: "warning" },
    config_error: { msg: "Debes configurar GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el archivo .env", tipo: "warning" },
    token_exchange_failed: { msg: "Error al intercambiar el token con Google. Verifica tu conexión y credenciales.", tipo: "error" },
    userinfo_failed: { msg: "No fue posible obtener el perfil de tu cuenta Google.", tipo: "error" },
    missing_email: { msg: "Tu cuenta Google no proporcionó un correo electrónico válido.", tipo: "error" },
    cuenta_inactiva: { msg: "Tu cuenta está registrada pero se encuentra inactiva. Contacta al administrador.", tipo: "error" },
    db_error: { msg: "Error de base de datos al registrar tu cuenta de Google.", tipo: "error" }
  };

  const item = mensajesError[error] || { msg: "Error en la autenticación con Google.", tipo: "error" };
  if (typeof mostrarToast === "function") {
    mostrarToast(item.msg, item.tipo);
  }

  // Limpiar la URL para evitar mostrar el toast nuevamente si el usuario recarga
  window.history.replaceState({}, document.title, window.location.pathname);
}

function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (typeof validarFormulario === "function" && !validarFormulario(form)) {
    mostrarToast("Por favor completa los campos requeridos.", "warning");
    return;
  }

  const emailInput = document.getElementById("login-email");
  const passInput = document.getElementById("login-password");
  const emailOUser = emailInput.value.trim().toLowerCase();
  const pass = passInput.value;

  // Cargar administradores actualizados desde localStorage o storage.js
  const listaAdmin = JSON.parse(localStorage.getItem("admin_datos")) || (typeof administrador !== "undefined" ? administrador : []);

  const adminEncontrado = listaAdmin.find(a => 
    (a.email.toLowerCase() === emailOUser || (a.nombre && a.nombre.toLowerCase() === emailOUser)) && 
    a.contrasena === pass
  );

  if (adminEncontrado) {
    localStorage.setItem("is_logged_in", "true");
    localStorage.setItem("active_user", JSON.stringify(adminEncontrado));
    if (typeof limpiarAutosave === "function") limpiarAutosave(AUTOSAVE_KEY_LOGIN);

    mostrarToast("¡Bienvenido, " + adminEncontrado.nombre + "! Redirigiendo...", "success");

    setTimeout(() => {
      window.location.href = "dashboard.html";
    }, 600);
  } else {
    // Feedback accesible
    const errorEl = document.getElementById("err-login-password");
    if (errorEl) {
      errorEl.textContent = "Credenciales incorrectas. Verifica tu correo y contraseña.";
    }
    passInput.classList.add("field-invalid");
    passInput.focus();
    mostrarToast("Acceso denegado: credenciales incorrectas.", "error");
  }
}

/**
 * Configura los botones de mostrar/ocultar contraseña con accesibilidad ARIA completa
 */
function configurarBotonesOjo(container) {
  container.querySelectorAll(".eye-toggle-btn").forEach(btn => {
    const targetId = btn.dataset.target;
    const targetInput = document.getElementById(targetId);
    if (!targetInput) return;

    btn.addEventListener("click", () => {
      const esPassword = targetInput.type === "password";
      targetInput.type = esPassword ? "text" : "password";
      
      btn.setAttribute("aria-label", esPassword ? "Ocultar contraseña" : "Mostrar contraseña");
      btn.setAttribute("aria-pressed", esPassword ? "true" : "false");
      
      const icon = btn.querySelector("i");
      if (icon) {
        icon.className = esPassword ? "ti ti-eye-off" : "ti ti-eye";
      }
      targetInput.focus();
    });
  });
}
