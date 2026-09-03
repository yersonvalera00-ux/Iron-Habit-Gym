/**
 * ==========================================================================
 * LÓGICA DE REGISTRO / CREAR CUENTA — registro.html
 * Iron Habit Gym · Ficha 3186630
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof redirigirSiYaHaySesion === "function" && redirigirSiYaHaySesion()) return;

  const form = document.getElementById("form-registro");
  if (!form) return;

  if (typeof activarLimpiezaDeErroresEnVivo === "function") activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", handleRegistroSubmit);

  // Configurar botones accesibles de visibilidad de contraseña
  configurarBotonesOjo(form);

  // Validación de coincidencia de contraseñas en vivo
  const passInput = document.getElementById("reg-password");
  const confirmInput = document.getElementById("reg-password-confirm");
  const errConfirm = document.getElementById("err-reg-password-confirm");

  confirmInput.addEventListener("input", () => {
    if (confirmInput.value && confirmInput.value !== passInput.value) {
      confirmInput.classList.add("field-invalid");
      if (errConfirm) errConfirm.textContent = "Las contraseñas no coinciden.";
    } else {
      confirmInput.classList.remove("field-invalid");
      if (errConfirm) errConfirm.textContent = "";
    }
  });
});

function handleRegistroSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (typeof validarFormulario === "function" && !validarFormulario(form)) {
    mostrarToast("Por favor completa los campos requeridos.", "warning");
    return;
  }

  const nombre = document.getElementById("reg-nombre").value.trim();
  const email = document.getElementById("reg-email").value.trim().toLowerCase();
  const pass = document.getElementById("reg-password").value;
  const passConfirm = document.getElementById("reg-password-confirm").value;

  // Validación de contraseñas iguales
  if (pass !== passConfirm) {
    const confirmInput = document.getElementById("reg-password-confirm");
    const errConfirm = document.getElementById("err-reg-password-confirm");
    confirmInput.classList.add("field-invalid");
    if (errConfirm) errConfirm.textContent = "Las contraseñas no coinciden.";
    confirmInput.focus();
    mostrarToast("Las contraseñas no coinciden.", "error");
    return;
  }

  // Validación de longitud mínima de contraseña
  if (pass.length < 6) {
    const passInput = document.getElementById("reg-password");
    const errPass = document.getElementById("err-reg-password");
    passInput.classList.add("field-invalid");
    if (errPass) errPass.textContent = "La contraseña debe tener al menos 6 caracteres.";
    passInput.focus();
    mostrarToast("La contraseña debe tener al menos 6 caracteres.", "warning");
    return;
  }

  // Obtener administradores actuales
  let listaAdmin = JSON.parse(localStorage.getItem("admin_datos"));
  if (!listaAdmin || !Array.isArray(listaAdmin)) {
    listaAdmin = typeof administrador !== "undefined" ? administrador : [];
  }

  // Verificar si el correo ya existe
  const correoExiste = listaAdmin.some(a => a.email.toLowerCase() === email);
  if (correoExiste) {
    const emailInput = document.getElementById("reg-email");
    const errEmail = document.getElementById("err-reg-email");
    emailInput.classList.add("field-invalid");
    if (errEmail) errEmail.textContent = "Este correo ya se encuentra registrado.";
    emailInput.focus();
    mostrarToast("El correo electrónico ya está registrado.", "error");
    return;
  }

  // Crear nuevo administrador
  const nuevoAdmin = {
    id: "u_" + Date.now(),
    nombre: nombre,
    email: email,
    contrasena: pass,
    rol: "Administrador"
  };

  listaAdmin.push(nuevoAdmin);
  localStorage.setItem("admin_datos", JSON.stringify(listaAdmin));
  
  if (typeof administrador !== "undefined") {
    administrador = listaAdmin;
  }
  if (typeof guardarBD === "function") {
    guardarBD();
  }

  mostrarToast("¡Cuenta creada exitosamente! Redirigiendo al inicio de sesión...", "success");

  // Redirigir a login con el email precargado
  setTimeout(() => {
    window.location.href = "login.html";
  }, 1200);
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
