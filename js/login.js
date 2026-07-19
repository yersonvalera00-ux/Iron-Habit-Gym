/**
 * ==========================================================================
 * LÓGICA DE LA PÁGINA DE LOGIN — login.html
 * ==========================================================================
 */

const AUTOSAVE_KEY_LOGIN = "draft_login_form";

document.addEventListener("DOMContentLoaded", () => {
  // Si ya hay una sesión activa, no tiene sentido mostrar el login
  if (redirigirSiYaHaySesion()) return;

  const form = document.getElementById("form-login-principal");
  const emailInput = document.getElementById("login-email");

  // Restauramos el correo (nunca la contraseña) si el usuario refrescó por accidente
  restaurarAutosave(form, AUTOSAVE_KEY_LOGIN);
  activarAutosave(form, AUTOSAVE_KEY_LOGIN, ["login-password"]);
  activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", handleLoginSubmit);

  const toggleBtn = document.getElementById("toggle-pwd-btn");
  toggleBtn.addEventListener("click", togglePasswordVisibility);
  toggleBtn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); togglePasswordVisibility(); }
  });
});

function handleLoginSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (!validarFormulario(form)) {
    mostrarToast("Completa el usuario y la contraseña para continuar.", "warning");
    return;
  }

  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;

  const adminEncontrado = administrador.find(a => a.email === email && a.contrasena === pass);

  if (adminEncontrado) {
    localStorage.setItem("is_logged_in", "true");
    localStorage.setItem("active_user", JSON.stringify(adminEncontrado));
    limpiarAutosave(AUTOSAVE_KEY_LOGIN);

    mostrarToast("Acceso concedido. Redirigiendo al panel...", "success");

    // Recarga real de página hacia el dashboard (tal como pediste para el login)
    setTimeout(() => { window.location.href = "dashboard.html"; }, 500);
  } else {
    mostrarToast("Acceso denegado: usuario o contraseña incorrectos. Usa yerson@control.com / admin123.", "error");
  }
}

function togglePasswordVisibility() {
  const pwdInput = document.getElementById("login-password");
  const toggleBtn = document.getElementById("toggle-pwd-btn");
  if (pwdInput.type === "password") {
    pwdInput.type = "text";
    toggleBtn.className = "ti ti-eye-off eye";
  } else {
    pwdInput.type = "password";
    toggleBtn.className = "ti ti-eye eye";
  }
}
