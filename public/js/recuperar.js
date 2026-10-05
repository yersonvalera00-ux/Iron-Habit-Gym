/**
 * ==========================================================================
 * LÓGICA DE RECUPERAR CONTRASEÑA — recuperar.html
 * Iron Habit Gym · Ficha 3186630
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  if (typeof redirigirSiYaHaySesion === "function" && redirigirSiYaHaySesion()) return;

  const form = document.getElementById("form-recuperar");
  if (!form) return;

  if (typeof activarLimpiezaDeErroresEnVivo === "function") activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", handleRecuperarSubmit);
});

function handleRecuperarSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (typeof validarFormulario === "function" && !validarFormulario(form)) {
    mostrarToast("Por favor introduce un correo válido.", "warning");
    return;
  }

  const emailInput = document.getElementById("recuperar-email");
  const email = emailInput.value.trim().toLowerCase();

  // Obtener administradores actuales
  let listaAdmin = JSON.parse(localStorage.getItem("admin_datos"));
  if (!listaAdmin || !Array.isArray(listaAdmin)) {
    listaAdmin = typeof administrador !== "undefined" ? administrador : [];
  }

  const adminEncontrado = listaAdmin.find(a => a.email.toLowerCase() === email);

  if (!adminEncontrado) {
    const errEmail = document.getElementById("err-recuperar-email");
    emailInput.classList.add("field-invalid");
    if (errEmail) errEmail.textContent = "No encontramos ninguna cuenta asociada a este correo.";
    emailInput.focus();
    mostrarToast("No existe ninguna cuenta registrada con este correo.", "error");
    return;
  }

  // Correo encontrado: Mostrar modal accesible de restablecimiento
  mostrarModalRecuperacion(adminEncontrado);
}

/**
 * Muestra un modal accesible para simular el restablecimiento de contraseña
 * @param {Object} adminUsuario
 */
function mostrarModalRecuperacion(adminUsuario) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay active-modal";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-labelledby", "modal-recuperar-title");

  overlay.innerHTML = `
    <div class="modal-card" style="max-width: 440px;">
      <div class="modal-header">
        <h3 id="modal-recuperar-title" style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="ti ti-mail-check" style="color: var(--success); font-size: 1.5rem;" aria-hidden="true"></i>
          Enlace de recuperación enviado
        </h3>
      </div>
      <div class="modal-body" style="padding: 1rem 0;">
        <p style="color: var(--text-sub); font-size: 0.925rem; line-height: 1.5; margin-bottom: 1rem;">
          Se ha enviado un enlace seguro de restablecimiento a <strong>${adminUsuario.email}</strong>.
        </p>
        <div style="background: var(--bg-input); border: 1px solid var(--input-border); border-radius: var(--radius-sm); padding: 0.875rem; margin-bottom: 1rem;">
          <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">Restablecimiento rápido de demostración:</p>
          <div class="input-with-icon" style="height: 2.5rem; margin-bottom: 0.5rem;">
            <i class="ti ti-lock" aria-hidden="true"></i>
            <input type="password" id="modal-new-pwd" placeholder="Nueva contraseña (mín 6 car.)" minlength="6" autocomplete="new-password">
          </div>
          <button type="button" id="btn-cambiar-pwd-directo" class="btn-dash btn-dash-primary" style="width: 100%; height: 2.25rem; font-size: 0.85rem;">
            Actualizar Contraseña Ahora
          </button>
        </div>
      </div>
      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 0.5rem;">
        <a href="login.html" class="btn-dash btn-dash-primary" style="text-decoration: none; display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem;">
          Ir a Iniciar Sesión
        </a>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Foco accesible al input del modal
  const inputNewPwd = overlay.querySelector("#modal-new-pwd");
  if (inputNewPwd) inputNewPwd.focus();

  // Cerrar con Escape
  const handleKeydown = (e) => {
    if (e.key === "Escape") {
      overlay.remove();
      document.removeEventListener("keydown", handleKeydown);
    }
  };
  document.addEventListener("keydown", handleKeydown);

  // Actualizar contraseña directo
  overlay.querySelector("#btn-cambiar-pwd-directo").addEventListener("click", () => {
    const nuevaClave = inputNewPwd.value.trim();
    if (nuevaClave.length < 6) {
      mostrarToast("La nueva contraseña debe tener al menos 6 caracteres.", "warning");
      inputNewPwd.focus();
      return;
    }

    let listaAdmin = JSON.parse(localStorage.getItem("admin_datos")) || [];
    const index = listaAdmin.findIndex(a => a.email.toLowerCase() === adminUsuario.email.toLowerCase());
    if (index !== -1) {
      listaAdmin[index].contrasena = nuevaClave;
      localStorage.setItem("admin_datos", JSON.stringify(listaAdmin));
      if (typeof administrador !== "undefined") {
        administrador = listaAdmin;
      }
      mostrarToast("¡Contraseña actualizada con éxito!", "success");
      setTimeout(() => {
        overlay.remove();
        window.location.href = "login.html";
      }, 1000);
    }
  });
}
