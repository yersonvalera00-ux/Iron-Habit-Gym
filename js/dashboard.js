/**
 * ==========================================================================
 * SHELL DEL DASHBOARD — dashboard.html
 * Ficha 3186630 · SENA Centro de Servicios Financieros
 *
 * Responsabilidades de este archivo:
 * 1. Proteger la ruta: si no hay sesión activa, expulsa a login.html
 * 2. Cargador maestro: al hacer clic en un enlace del menú, hace un fetch()
 *    del fragmento HTML correspondiente, limpia el contenedor principal
 *    (innerHTML = '') y renderiza el nuevo contenido (Carga Asíncrona).
 * 3. History API (history.pushState) para que "Atrás/Adelante" del navegador
 *    naveguen entre pestañas del dashboard sin recargar toda la página.
 * 4. Barra lateral, tema y cierre de sesión.
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. REGISTRO DE SECCIONES: qué fragmento HTML y qué función de inicio
//    corresponde a cada pestaña del menú lateral.
// --------------------------------------------------------------------------
const registroSecciones = {
  "tab-kpis": {
    url: "sections/kpis.html",
    titulo: "Panel de Control",
    init: () => window.initTabKpis && window.initTabKpis()
  },
  "tab-socios": {
    url: "sections/socios.html",
    titulo: "Gestión de Socios (Clientes)",
    init: () => window.initTabSocios && window.initTabSocios()
  },
  "tab-mensualidades": {
    url: "sections/mensualidades.html",
    titulo: "Control de Mensualidades y Caja",
    init: () => window.initTabMensualidades && window.initTabMensualidades()
  },
  "tab-rutinas": {
    url: "sections/rutinas.html",
    titulo: "Asignación de Rutinas de Entrenamiento",
    init: () => window.initTabRutinas && window.initTabRutinas()
  },
  "tab-estadisticas": {
    url: "sections/estadisticas.html",
    titulo: "Reportes y Gráficas de Rendimiento",
    init: () => window.initTabEstadisticas && window.initTabEstadisticas()
  },
  "tab-configuracion": {
    url: "sections/configuracion.html",
    titulo: "Configuración del Sistema",
    init: () => window.initTabConfiguracion && window.initTabConfiguracion()
  }
};

const panel = () => document.getElementById("dashboard-view-panel");

// --------------------------------------------------------------------------
// 2. CARGADOR MAESTRO (FETCH + INNERHTML + HISTORY API)
// --------------------------------------------------------------------------

/**
 * Carga de forma asíncrona el fragmento HTML de una pestaña del dashboard.
 * @param {string} tabId - clave de registroSecciones (ej. "tab-socios")
 * @param {object} opciones
 * @param {boolean} [opciones.pushState=true] - si debe agregarse al historial
 */
async function cargarSeccion(tabId, { pushState = true } = {}) {
  const seccion = registroSecciones[tabId];
  if (!seccion) return;

  const contenedor = panel();

  // Estado de carga (feedback visual mientras llega el fetch)
  contenedor.innerHTML = `
    <div class="section-loading-state">
      <i class="ti ti-loader-2 spin-icon"></i>
      <span>Cargando sección...</span>
    </div>
  `;

  try {
    const respuesta = await fetch(seccion.url, { cache: "no-store" });
    if (!respuesta.ok) throw new Error("No se pudo cargar " + seccion.url);
    const html = await respuesta.text();

    // Limpiamos el contenedor principal y renderizamos el nuevo contenido
    contenedor.innerHTML = "";
    contenedor.innerHTML = html;

    // Activamos botón correspondiente en la barra lateral
    document.querySelectorAll(".sidebar-link[data-tab]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tabId);
    });

    // Actualizamos el título de la barra superior
    document.getElementById("topbar-section-title").innerText = seccion.titulo;

    // Ejecutamos la inicialización propia de esa pestaña (listeners, tablas, etc.)
    seccion.init();

    // History API: registramos la navegación para que Atrás/Adelante funcionen
    if (pushState) {
      history.pushState({ tab: tabId }, "", "?tab=" + tabId);
    }

    // En móvil, cerramos la barra lateral tras seleccionar una opción
    document.getElementById("dashboard-sidebar").classList.remove("show-sidebar");

  } catch (error) {
    contenedor.innerHTML = `
      <div class="section-loading-state" style="color:var(--danger);">
        <i class="ti ti-alert-triangle"></i>
        <span>No se pudo cargar esta sección. Verifica que el sitio se esté sirviendo desde un servidor local (no con doble clic al archivo).</span>
      </div>
    `;
    mostrarToast("Error al cargar la sección: " + error.message, "error");
  }
}

/** Lee la pestaña solicitada desde la URL actual (?tab=...) */
function pestañaDesdeURL() {
  const params = new URLSearchParams(window.location.search);
  const tab = params.get("tab");
  return registroSecciones[tab] ? tab : "tab-kpis";
}

// Navegación con los botones Atrás/Adelante del navegador
window.addEventListener("popstate", (event) => {
  const tab = (event.state && event.state.tab) || pestañaDesdeURL();
  cargarSeccion(tab, { pushState: false });
});

// --------------------------------------------------------------------------
// 3. INICIALIZACIÓN DE LA PÁGINA
// --------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Protegemos la ruta: sin sesión activa no hay dashboard
  if (!requerirSesionActiva()) return;

  pintarDatosUsuarioActivo();

  // Clics del menú lateral -> cargador maestro
  document.querySelectorAll(".sidebar-link[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => cargarSeccion(btn.dataset.tab));
  });

  document.getElementById("btn-toggle-sidebar").addEventListener("click", toggleSidebar);
  document.getElementById("btn-toggle-theme").addEventListener("click", toggleDarkMode);
  document.getElementById("btn-logout").addEventListener("click", handleLogout);

  document.getElementById("btn-close-ficha-modal").addEventListener("click", closeFichaModal);
  document.getElementById("btn-close-ficha-modal-2").addEventListener("click", closeFichaModal);

  // Carga inicial: respeta el ?tab= de la URL (por si el usuario recarga o
  // llega desde un enlace directo/favorito), y deja el historial consistente
  const tabInicial = pestañaDesdeURL();
  cargarSeccion(tabInicial, { pushState: false });
  history.replaceState({ tab: tabInicial }, "", "?tab=" + tabInicial);
});

function pintarDatosUsuarioActivo() {
  const user = JSON.parse(localStorage.getItem("active_user"));
  if (!user) return;

  document.getElementById("current-user-name").innerText = user.nombre;
  document.getElementById("topbar-user-display").innerText = user.nombre.split(" ")[0];
  const iniciales = user.nombre.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  document.getElementById("current-user-avatar").innerText = iniciales;
  document.getElementById("topbar-avatar").innerText = iniciales;
}

function toggleSidebar() {
  document.getElementById("dashboard-sidebar").classList.toggle("show-sidebar");
}

async function handleLogout() {
  const confirmado = await confirmarAccion("¿Estás seguro de que deseas cerrar sesión de forma segura?");
  if (!confirmado) return;

  localStorage.removeItem("is_logged_in");
  localStorage.removeItem("active_user");
  window.location.href = "index.html";
}

function closeFichaModal() {
  document.getElementById("modal-ficha-corporal").classList.remove("active-modal");
}
