/**
 * ==========================================================================
 * UTILIDADES COMUNES — GYM CONTROL (IRON HABIT GYM)
 * Ficha 3186630 · SENA Centro de Servicios Financieros
 *
 * Funciones compartidas por index.html, login.html y dashboard.html:
 * - Modo Claro/Oscuro persistido en localStorage
 * - Sistema de notificaciones tipo "toast" (reemplaza los alert())
 * - Validación y feedback visual de formularios
 * - Autoguardado de borradores de formularios en sessionStorage
 * - Guardas de sesión (requiere sesión / redirige si ya hay sesión)
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. MODO CLARO / OSCURO (persistido en localStorage: es una preferencia
//    pequeña que debe sobrevivir a un refresco de página, tal como pediste)
// --------------------------------------------------------------------------

function toggleDarkMode() {
  const body = document.getElementById("app-body");
  const icon = document.getElementById("theme-icon");

  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    if (icon) icon.className = "ti ti-moon";
    localStorage.setItem("theme_preference", "dark");
  } else {
    if (icon) icon.className = "ti ti-sun";
    localStorage.setItem("theme_preference", "light");
  }
}

function aplicarPreferenciaTema() {
  const pref = localStorage.getItem("theme_preference");
  const body = document.getElementById("app-body");
  const icon = document.getElementById("theme-icon");

  if (pref === "dark") {
    body.classList.add("dark");
    if (icon) icon.className = "ti ti-moon";
  } else {
    body.classList.remove("dark");
    if (icon) icon.className = "ti ti-sun";
  }
}

// Aplicamos el tema apenas se carga cualquier página (landing, login o dashboard)
document.addEventListener("DOMContentLoaded", aplicarPreferenciaTema);

// --------------------------------------------------------------------------
// 2. SISTEMA DE NOTIFICACIONES (TOASTS)
//    Sustituye los alert()/confirm() bloqueantes por una experiencia más
//    profesional y acorde a la identidad visual de Iron Habit Gym.
// --------------------------------------------------------------------------

/**
 * Muestra una notificación flotante no bloqueante.
 * @param {string} mensaje
 * @param {"success"|"error"|"warning"|"info"} tipo
 */
function mostrarToast(mensaje, tipo = "info") {
  const container = document.getElementById("toast-container");
  if (!container) { alert(mensaje); return; }

  const iconos = {
    success: "ti-circle-check",
    error: "ti-alert-circle",
    warning: "ti-alert-triangle",
    info: "ti-info-circle"
  };

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${tipo}`;
  toast.innerHTML = `
    <i class="ti ${iconos[tipo] || iconos.info}"></i>
    <span>${mensaje}</span>
    <button class="toast-close" aria-label="Cerrar notificación"><i class="ti ti-x"></i></button>
  `;

  container.appendChild(toast);

  const cerrar = () => {
    toast.classList.add("toast-hide");
    setTimeout(() => toast.remove(), 250);
  };

  toast.querySelector(".toast-close").addEventListener("click", cerrar);
  setTimeout(cerrar, 4500);
}

/**
 * Reemplazo no bloqueante de confirm(). Devuelve una Promise<boolean>.
 * Se apoya en el mismo modal de ficha corporal? No: crea un mini overlay propio,
 * ligero y reutilizable, respetando la paleta de la marca.
 */
function confirmarAccion(mensaje) {
  return new Promise((resolve) => {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay active-modal";
    overlay.innerHTML = `
      <div class="modal-card" style="max-width:400px;">
        <div class="modal-header">
          <h3>Confirmar acción</h3>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-sub); font-size:0.9rem;">${mensaje}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-dash btn-dash-secondary" id="confirm-cancel-btn">Cancelar</button>
          <button class="btn-dash btn-dash-danger" id="confirm-ok-btn">Confirmar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.querySelector("#confirm-cancel-btn").addEventListener("click", () => {
      overlay.remove();
      resolve(false);
    });
    overlay.querySelector("#confirm-ok-btn").addEventListener("click", () => {
      overlay.remove();
      resolve(true);
    });
  });
}

// --------------------------------------------------------------------------
// 3. VALIDACIÓN Y FEEDBACK VISUAL DE FORMULARIOS
//    Mejora pedida: en vez de dejar que el navegador bloquee el envío en
//    silencio, marcamos el campo inválido y mostramos un mensaje claro.
// --------------------------------------------------------------------------

/**
 * Valida un formulario usando las reglas nativas de HTML5 (required, pattern,
 * type=email, min/max, etc.) y pinta el error debajo de cada campo inválido.
 * @param {HTMLFormElement} form
 * @returns {boolean} true si el formulario es válido
 */
function validarFormulario(form) {
  let esValido = true;
  let primerCampoInvalido = null;

  form.querySelectorAll("input, select, textarea").forEach((campo) => {
    const errorEl = document.getElementById("err-" + campo.id);
    if (campo.checkValidity()) {
      campo.classList.remove("field-invalid");
      if (errorEl) errorEl.textContent = "";
    } else {
      esValido = false;
      campo.classList.add("field-invalid");
      if (errorEl) errorEl.textContent = mensajeDeErrorPara(campo);
      if (!primerCampoInvalido) primerCampoInvalido = campo;
    }
  });

  if (primerCampoInvalido) {
    primerCampoInvalido.focus();
    primerCampoInvalido.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return esValido;
}

function mensajeDeErrorPara(campo) {
  if (campo.validity.valueMissing) return "Este campo es obligatorio.";
  if (campo.validity.typeMismatch && campo.type === "email") return "Ingresa un correo electrónico válido.";
  if (campo.validity.patternMismatch) return campo.title || "El formato ingresado no es válido.";
  if (campo.validity.rangeUnderflow) return `El valor mínimo permitido es ${campo.min}.`;
  if (campo.validity.rangeOverflow) return `El valor máximo permitido es ${campo.max}.`;
  return "Revisa el valor ingresado.";
}

/**
 * Limpia los mensajes/estados de error de un campo apenas el usuario escribe,
 * para que el formulario se sienta vivo y no quede el error pegado.
 */
function activarLimpiezaDeErroresEnVivo(form) {
  form.querySelectorAll("input, select, textarea").forEach((campo) => {
    campo.addEventListener("input", () => {
      if (campo.checkValidity()) {
        campo.classList.remove("field-invalid");
        const errorEl = document.getElementById("err-" + campo.id);
        if (errorEl) errorEl.textContent = "";
      }
    });
  });
}

// --------------------------------------------------------------------------
// 4. AUTOGUARDADO DE BORRADORES (sessionStorage)
//    Pedido explícitamente: que si el usuario refresca por accidente, no
//    pierda el último formulario que estaba llenando.
// --------------------------------------------------------------------------

/**
 * Activa el autoguardado de un formulario en sessionStorage.
 * @param {HTMLFormElement} form
 * @param {string} storageKey - clave única en sessionStorage
 * @param {string[]} [ignorar] - ids de campos que NO deben guardarse (ej. contraseñas)
 */
function activarAutosave(form, storageKey, ignorar = []) {
  const guardar = () => {
    const datos = {};
    form.querySelectorAll("input, select, textarea").forEach((campo) => {
      if (!campo.id || ignorar.includes(campo.id) || campo.type === "password") return;
      if (campo.type === "checkbox") {
        datos[campo.id] = campo.checked;
      } else {
        datos[campo.id] = campo.value;
      }
    });
    sessionStorage.setItem(storageKey, JSON.stringify(datos));

    const marca = document.getElementById(form.id + "-autosave-indicator");
    if (marca) {
      marca.textContent = "Borrador guardado";
      marca.classList.add("show");
      clearTimeout(marca._timeout);
      marca._timeout = setTimeout(() => marca.classList.remove("show"), 1500);
    }
  };

  form.addEventListener("input", debounce(guardar, 400));
}

/**
 * Restaura un borrador previamente guardado (si existe) en el formulario dado.
 * Debe llamarse justo después de insertar el HTML del formulario en el DOM.
 * @param {HTMLFormElement} form
 * @param {string} storageKey
 * @returns {boolean} true si había un borrador y se restauró
 */
function restaurarAutosave(form, storageKey) {
  const guardado = sessionStorage.getItem(storageKey);
  if (!guardado) return false;

  try {
    const datos = JSON.parse(guardado);
    let huboContenido = false;
    Object.keys(datos).forEach((id) => {
      const campo = document.getElementById(id);
      if (!campo) return;
      if (campo.type === "checkbox") {
        campo.checked = datos[id];
      } else if (datos[id]) {
        campo.value = datos[id];
        huboContenido = true;
      }
    });
    return huboContenido;
  } catch (e) {
    return false;
  }
}

function limpiarAutosave(storageKey) {
  sessionStorage.removeItem(storageKey);
}

/** Pequeño debounce para no saturar sessionStorage en cada tecla */
function debounce(fn, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

// --------------------------------------------------------------------------
// 5. GUARDAS DE SESIÓN
// --------------------------------------------------------------------------

/** Usado por dashboard.html: si no hay sesión activa, expulsa a login.html */
function requerirSesionActiva() {
  if (localStorage.getItem("is_logged_in") !== "true") {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

/** Usado por login.html: si ya hay sesión activa, no tiene sentido ver el login */
function redirigirSiYaHaySesion() {
  if (localStorage.getItem("is_logged_in") === "true") {
    window.location.href = "dashboard.html";
    return true;
  }
  return false;
}

// --------------------------------------------------------------------------
// 6. HELPERS VARIOS
// --------------------------------------------------------------------------

function fechaHoyISO() {
  return new Date().toISOString().split("T")[0];
}

function formatearMoneda(valor) {
  return "$" + Number(valor || 0).toLocaleString("es-CO");
}
