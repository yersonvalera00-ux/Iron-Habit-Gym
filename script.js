/**
 * ==========================================================================
 * LÓGICA DE CONTROL DE APLICACIÓN Y BASE DE DATOS — GYM CONTROL
 * Ficha 3186630 · SENA Centro de Servicios Financieros
 * 
 * Este archivo contiene toda la interactividad del Single Page Application (SPA),
 * el cálculo automático de métricas corporales (IMC), y un simulador pedagógico
 * que genera en pantalla las consultas SQL que se alimentarían a MySQL Workbench.
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. ESTRUCTURAS DE DATOS SEMILLA (SIMULACIÓN DE TABLAS DE BASE DE DATOS)
// --------------------------------------------------------------------------

// Precios de las membresías configurados en el sistema
const membresiasPredefinidas = {
  m1: { id: "m1", tipo: "Plan Mensual General", precio: 120000, duracion: "1 Mes" },
  m2: { id: "m2", tipo: "Plan Trimestral", precio: 320000, duracion: "3 Meses" },
  m3: { id: "m3", tipo: "Plan Anual VIP", precio: 1000000, duracion: "1 Año" }
};

// Catálogo de Ejercicios preestablecidos para el Módulo de Rutinas
const catalogoEjercicios = [
  { id: "e1", nombre: "Sentadillas Libres", grupo: "Piernas", desc: "4 series x 12 repeticiones con barra." },
  { id: "e2", nombre: "Prensa Inclinada", grupo: "Piernas", desc: "4 series x 10 repeticiones progresivas." },
  { id: "e3", nombre: "Press de Banca Plana", grupo: "Pecho", desc: "4 series x 10 repeticiones con barra." },
  { id: "e4", nombre: "Aperturas con Mancuernas", grupo: "Pecho", desc: "3 series x 12 repeticiones." },
  { id: "e5", nombre: "Jalón al Pecho", grupo: "Espalda", desc: "4 series x 12 repeticiones en polea." },
  { id: "e6", nombre: "Remo con Mancuerna", grupo: "Espalda", desc: "3 series x 10 repeticiones por brazo." },
  { id: "e7", nombre: "Curl de Bíceps", grupo: "Brazos", desc: "3 series x 12 repeticiones alternadas." },
  { id: "e8", nombre: "Copa de Tríceps", grupo: "Brazos", desc: "4 series x 12 repeticiones con mancuerna." },
  { id: "e9", nombre: "Cinta de Correr", grupo: "Cardio", desc: "20 minutos a intensidad moderada." },
  { id: "e10", nombre: "Spinning Guiado", grupo: "Cardio", desc: "30 minutos de sesión interactiva." }
];

// Usuarios Administradores autorizados del sistema (El usuario solicitó iniciar solo con su cuenta)
const administradorPorDefecto = [
  { id: "u1", nombre: "Yerson Valera", email: "yerson@control.com", contrasena: "admin123", rol: "Administrador" }
];

// --------------------------------------------------------------------------
// 2. INICIALIZACIÓN DE LA PERSISTENCIA (LOCALSTORAGE)
// --------------------------------------------------------------------------

// Obtenemos los datos actuales guardados en el navegador o cargamos arreglos vacíos para simular bases de datos limpias
let administrador = JSON.parse(localStorage.getItem("admin_datos")) || administradorPorDefecto;
let socios = JSON.parse(localStorage.getItem("socios_datos")) || [];
let fichasCorporales = JSON.parse(localStorage.getItem("fichas_datos")) || {};
let pagosCaja = JSON.parse(localStorage.getItem("pagos_datos")) || [];
let rutinasAsignadas = JSON.parse(localStorage.getItem("rutinas_datos")) || [];
let configuracionTarifas = JSON.parse(localStorage.getItem("tarifas_datos")) || membresiasPredefinidas;

/**
 * Guarda el estado actual de todas las variables en LocalStorage
 */
function guardarBD() {
  localStorage.setItem("admin_datos", JSON.stringify(administrador));
  localStorage.setItem("socios_datos", JSON.stringify(socios));
  localStorage.setItem("fichas_datos", JSON.stringify(fichasCorporales));
  localStorage.setItem("pagos_datos", JSON.stringify(pagosCaja));
  localStorage.setItem("rutinas_datos", JSON.stringify(rutinasAsignadas));
  localStorage.setItem("tarifas_datos", JSON.stringify(configuracionTarifas));
}

// --------------------------------------------------------------------------
// 3. ENRUTADOR Y MANEJO DEL ESTADO DE SESIÓN (SPA NAVIGATION)
// --------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  // Comprobamos si el usuario ya tenía una sesión activa al recargar la página
  comprobarEstadoSesion();
  
  // Seteamos la fecha por defecto de hoy a los formularios
  const hoy = new Date().toISOString().split('T')[0];
  const camposFecha = ["socio-fecha", "pago-fecha", "rutina-fecha"];
  camposFecha.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = hoy;
  });

  // Renderizamos el catálogo de ejercicios en el formulario de rutinas
  renderizarCatalogoEjercicios();
});

/**
 * Cambia la vista principal de la aplicación ocultando los contenedores inactivos
 * @param {string} layoutId - ID del elemento contenedor a mostrar (layout-landing, layout-login, layout-dashboard)
 */
function navigateTo(layoutId) {
  // Ocultamos todas las vistas
  document.querySelectorAll(".page-layout, .dashboard-container").forEach(el => {
    el.classList.remove("active-layout");
  });

  // Mostramos la seleccionada
  const target = document.getElementById(layoutId);
  if (target) {
    target.classList.add("active-layout");
  }

  // Si navega de regreso a la Landing Page, restablecemos la clase del body
  if (layoutId === 'layout-landing') {
    document.getElementById("app-body").className = "landing-body";
  } else if (layoutId === 'layout-login') {
    document.getElementById("app-body").className = "";
  } else if (layoutId === 'layout-dashboard') {
    document.getElementById("app-body").className = "";
  }
}

/**
 * Alterna entre las pestañas internas del Dashboard administrativo
 * @param {string} tabId - ID de la pestaña a mostrar (tab-kpis, tab-socios, tab-mensualidades, tab-rutinas, tab-configuracion)
 */
function switchDashboardTab(tabId) {
  // Ocultamos todas las pestañas de contenido del Dashboard
  document.querySelectorAll(".dashboard-tab-content").forEach(el => {
    el.style.display = "none";
  });

  // Quitamos la clase 'active' de todos los botones de navegación lateral
  document.querySelectorAll(".sidebar-link").forEach(el => {
    el.classList.remove("active");
  });

  // Mostramos el contenido de la pestaña seleccionada
  document.getElementById(tabId).style.display = "block";

  // Activamos el botón correspondiente
  const activeBtn = document.getElementById("btn-" + tabId);
  if (activeBtn) activeBtn.classList.add("active");

  // Actualizamos el título de la sección en la barra superior
  const titulos = {
    "tab-kpis": "Panel de Control",
    "tab-socios": "Gestión de Socios (Clientes)",
    "tab-mensualidades": "Control de Mensualidades y Caja",
    "tab-rutinas": "Asignación de Rutinas de Entrenamiento",
    "tab-estadisticas": "Reportes y Gráficas de Rendimiento",
    "tab-configuracion": "Configuración del Sistema"
  };
  document.getElementById("topbar-section-title").innerText = titulos[tabId] || "Panel de Control";

  // Si abrimos la pestaña de KPIs o de Estadísticas, volvemos a renderizar las gráficas dinámicas
  if (tabId === "tab-kpis" || tabId === "tab-estadisticas") {
    actualizarGraficasSVG();
  }

  // Si abrimos mensualidades o rutinas, actualizamos los dropdowns de socios
  if (tabId === "tab-mensualidades" || tabId === "tab-rutinas") {
    actualizarDropdownsSocios();
  }
}

// Alterna la barra lateral en dispositivos móviles
function toggleSidebar() {
  const sidebar = document.getElementById("dashboard-sidebar");
  sidebar.classList.toggle("show-sidebar");
}

// --------------------------------------------------------------------------
// 4. MODO CLARO / OSCURO (THEME SWITCHER)
// --------------------------------------------------------------------------

/**
 * Activa o desactiva el Modo Oscuro agregando la clase '.dark' al cuerpo del HTML
 */
function toggleDarkMode() {
  const body = document.getElementById("app-body");
  const icon = document.getElementById("theme-icon");
  
  body.classList.toggle("dark");
  
  if (body.classList.contains("dark")) {
    icon.className = "ti ti-moon";
    localStorage.setItem("theme_preference", "dark");
  } else {
    icon.className = "ti ti-sun";
    localStorage.setItem("theme_preference", "light");
  }
}

/**
 * Comprueba las preferencias del tema guardadas en el navegador
 */
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

// --------------------------------------------------------------------------
// 5. AUTENTICACIÓN (LOGIN) Y CONTROL DE SESIÓN
// --------------------------------------------------------------------------

/**
 * Controla el envío del formulario de inicio de sesión
 */
function handleLoginSubmit(event) {
  event.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-password").value;

  // Buscamos si existe el administrador en la estructura
  const adminEncontrado = administrador.find(a => a.email === email && a.contrasena === pass);

  if (adminEncontrado) {
    // Almacenamos el estado en LocalStorage para simular sesión iniciada
    localStorage.setItem("is_logged_in", "true");
    localStorage.setItem("active_user", JSON.stringify(adminEncontrado));
    
    // Cambiamos a la interfaz de administración
    comprobarEstadoSesion();
    actualizarVistaDashboard();
    navigateTo("layout-dashboard");
    
    // Limpiamos formulario
    document.getElementById("form-login-principal").reset();
  } else {
    alert("Acceso denegado: Usuario o contraseña incorrectos. Utiliza yerson@control.com / admin123 para ingresar.");
  }
}

/**
 * Verifica si hay una sesión iniciada al cargar y redirige según corresponda
 */
function comprobarEstadoSesion() {
  aplicarPreferenciaTema();
  const logged = localStorage.getItem("is_logged_in");
  if (logged === "true") {
    const user = JSON.parse(localStorage.getItem("active_user"));
    
    // Pintamos los datos en la barra lateral y superior del Admin
    if (user) {
      document.getElementById("current-user-name").innerText = user.nombre;
      document.getElementById("topbar-user-display").innerText = user.nombre.split(" ")[0];
      const iniciales = user.nombre.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
      document.getElementById("current-user-avatar").innerText = iniciales;
      document.getElementById("topbar-avatar").innerText = iniciales;
    }
    
    actualizarVistaDashboard();
    navigateTo("layout-dashboard");
    switchDashboardTab("tab-kpis");
  } else {
    navigateTo("layout-landing");
  }
}

/**
 * Cierra la sesión activa de manera segura y limpia el estado local
 */
function handleLogout() {
  if (confirm("¿Estás seguro de que deseas cerrar sesión de forma segura?")) {
    localStorage.removeItem("is_logged_in");
    localStorage.removeItem("active_user");
    navigateTo("layout-landing");
  }
}

/**
 * Muestra/Oculta los caracteres de la contraseña en el Login
 */
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

// --------------------------------------------------------------------------
// 6. CONTROLADOR DE LA CONSOLA PEDAGÓGICA (SQL FEEDBACK PARA EL SENA)
// --------------------------------------------------------------------------

/**
 * Imprime en la consola del Dashboard la consulta SQL que se ejecutaría
 * en MySQL Workbench para insertar o actualizar la información correspondiente.
 * 
 * @param {string} accion - Tipo de operación (INSERT_SOCIO, INSERT_PAGO, INSERT_RUTINA)
 * @param {object} datos - Datos del objeto que se están procesando
 */
function actualizarSQLConsola(accion, datos) {
  const consola = document.getElementById("db-sql-console");
  if (!consola) return;

  let query = "";

  switch (accion) {
    case "INSERT_SOCIO":
      query = `-- =========================================================================\n`;
      query += `-- REGISTRO DE NUEVO SOCIO (Simulación en MySQL Workbench)\n`;
      query += `-- =========================================================================\n\n`;
      query += `-- 1. Insertamos datos generales en la tabla Persona (Superclase en el UML)\n`;
      query += `<span class="keyword">INSERT INTO</span> <span class="table">Persona</span> (nombre) \n`;
      query += `<span class="keyword">VALUES</span> (<span class="value">'${datos.nombre}'</span>);\n\n`;
      query += `-- 2. Guardamos los datos de la membresía en la tabla Socio usando el ID generado\n`;
      query += `<span class="keyword">INSERT INTO</span> <span class="table">Socio</span> (ID_Socio, Nombre, Telefono, Email, Fecha_Ingreso, Inscrito, Estado_Actual, ID_Membresia) \n`;
      query += `<span class="keyword">VALUES</span> (\n`;
      query += `  <span class="keyword">LAST_INSERT_ID()</span>, \n`;
      query += `  <span class="value">'${datos.nombre}'</span>, \n`;
      query += `  <span class="value">'${datos.telefono}'</span>, \n`;
      query += `  <span class="value">'${datos.email}'</span>, \n`;
      query += `  <span class="value">'${datos.fecha}'</span>, \n`;
      query += `  <span class="value">true</span>, \n`;
      query += `  <span class="value">'${datos.estado}'</span>, \n`;
      query += `  <span class="value">'${datos.membresiaId}'</span>\n`;
      query += `);\n\n`;
      query += `-- 3. Guardamos las medidas iniciales del socio en la tabla de Ficha Física\n`;
      query += `<span class="keyword">INSERT INTO</span> <span class="table">Ficha_Corporal</span> (ID_Socio, Peso, Estatura, Grasa, Musculo, Antecedentes) \n`;
      query += `<span class="keyword">VALUES</span> (\n`;
      query += `  <span class="keyword">LAST_INSERT_ID()</span>, \n`;
      query += `  <span class="value">${datos.ficha.peso || "NULL"}</span>, \n`;
      query += `  <span class="value">${datos.ficha.estatura || "NULL"}</span>, \n`;
      query += `  <span class="value">${datos.ficha.grasa || "NULL"}</span>, \n`;
      query += `  <span class="value">${datos.ficha.musculo || "NULL"}</span>, \n`;
      query += `  <span class="value">'${datos.ficha.antecedentes || "Ninguno"}'</span>\n`;
      query += `);`;
      break;

    case "UPDATE_SOCIO":
      query = `-- ACTUALIZAR DATOS DE SOCIO EXISTENTE\n`;
      query += `<span class="keyword">UPDATE</span> <span class="table">Socio</span> \n`;
      query += `<span class="keyword">SET</span> \n`;
      query += `  Nombre = <span class="value">'${datos.nombre}'</span>, \n`;
      query += `  Telefono = <span class="value">'${datos.telefono}'</span>, \n`;
      query += `  Email = <span class="value">'${datos.email}'</span>, \n`;
      query += `  Estado_Actual = <span class="value">'${datos.estado}'</span>\n`;
      query += `<span class="keyword">WHERE</span> ID_Socio = <span class="value">${datos.id}</span>;`;
      break;

    case "DELETE_SOCIO":
      query = `-- ELIMINAR SOCIO Y SUS DEPENDENCIAS EN CASCADE\n`;
      query += `<span class="keyword">DELETE FROM</span> <span class="table">Socio</span> <span class="keyword">WHERE</span> ID_Socio = <span class="value">${datos.id}</span>;`;
      break;

    case "INSERT_PAGO":
      query = `-- =========================================================================\n`;
      query += `-- REGISTRO DE TRANSACCIÓN / RECIBO DE CAJA (MySQL Workbench)\n`;
      query += `-- =========================================================================\n\n`;
      query += `<span class="keyword">INSERT INTO</span> <span class="table">Pago</span> (Monto, Fecha_Pago, Metodo, ID_Socio) \n`;
      query += `<span class="keyword">VALUES</span> (\n`;
      query += `  <span class="value">${datos.monto}</span>, \n`;
      query += `  <span class="value">'${datos.fecha}'</span>, \n`;
      query += `  <span class="value">'${datos.metodo}'</span>, \n`;
      query += `  <span class="value">${datos.socioId}</span>\n`;
      query += `);\n\n`;
      query += `-- Alimentamos e inscribimos activando el estado de membresía del socio\n`;
      query += `<span class="keyword">UPDATE</span> <span class="table">Socio</span> \n`;
      query += `<span class="keyword">SET</span> Estado_Actual = <span class="value">'Activo'</span> \n`;
      query += `<span class="keyword">WHERE</span> ID_Socio = <span class="value">${datos.socioId}</span>;`;
      break;

    case "INSERT_RUTINA":
      query = `-- =========================================================================\n`;
      query += `-- ASIGNACIÓN DE PLAN DE ENTRENAMIENTO (MySQL Workbench)\n`;
      query += `-- =========================================================================\n\n`;
      query += `<span class="keyword">INSERT INTO</span> <span class="table">Rutina</span> (ID_Socio, Grupo_Muscular, Ejercicios, Fecha_Asignada) \n`;
      query += `<span class="keyword">VALUES</span> (\n`;
      query += `  <span class="value">${datos.socioId}</span>, \n`;
      query += `  <span class="value">'${datos.grupo}'</span>, \n`;
      query += `  <span class="value">'${datos.ejercicios}'</span>, \n`;
      query += `  <span class="value">'${datos.fechaAsignada}'</span>\n`;
      query += `);`;
      break;
      
    case "UPDATE_TARIFAS":
      query = `-- ACTUALIZAR PRECIOS DEL CATÁLOGO DE MEMBRESÍAS\n`;
      query += `<span class="keyword">UPDATE</span> <span class="table">Membresia</span> <span class="keyword">SET</span> Precio = <span class="value">${datos.m1}</span> <span class="keyword">WHERE</span> ID_Membresia = <span class="value">1</span>;\n`;
      query += `<span class="keyword">UPDATE</span> <span class="table">Membresia</span> <span class="keyword">SET</span> Precio = <span class="value">${datos.m2}</span> <span class="keyword">WHERE</span> ID_Membresia = <span class="value">2</span>;\n`;
      query += `<span class="keyword">UPDATE</span> <span class="table">Membresia</span> <span class="keyword">SET</span> Precio = <span class="value">${datos.m3}</span> <span class="keyword">WHERE</span> ID_Membresia = <span class="value">3</span>;`;
      break;
  }

  consola.innerHTML = query;
}

// --------------------------------------------------------------------------
// 7. GESTIÓN DE SOCIOS (CRUD DE CLIENTES Y IMC)
// --------------------------------------------------------------------------

/**
 * Controla el registro de un socio o su edición
 */
function handleSocioSubmit(event) {
  event.preventDefault();
  
  const idSocio = document.getElementById("socio-id").value;
  const nombre = document.getElementById("socio-nombre").value.trim();
  const telefono = document.getElementById("socio-telefono").value.trim();
  const email = document.getElementById("socio-email").value.trim();
  const membresiaId = document.getElementById("socio-membresia").value;
  const fecha = document.getElementById("socio-fecha").value;
  const estado = document.getElementById("socio-estado").value;
  
  // Medidas de la ficha física
  const pesoVal = document.getElementById("socio-peso").value;
  const estaturaVal = document.getElementById("socio-estatura").value;
  const grasaVal = document.getElementById("socio-grasa").value;
  const musculoVal = document.getElementById("socio-musculo").value;
  const antecedentes = document.getElementById("socio-antecedentes").value.trim();

  const datosFicha = {
    peso: pesoVal,
    estatura: estaturaVal,
    grasa: grasaVal,
    musculo: musculoVal,
    antecedentes: antecedentes || "Ninguno"
  };

  if (idSocio === "") {
    // NUEVO SOCIO
    const nuevoId = socios.length > 0 ? Math.max(...socios.map(s => s.id)) + 1 : 1;
    const nuevoSocio = {
      id: nuevoId,
      nombre: nombre,
      telefono: telefono,
      email: email,
      membresiaId: membresiaId,
      fecha: fecha,
      estado: estado
    };

    socios.push(nuevoSocio);
    
    // Almacenamos la ficha del socio usando su ID como llave
    fichasCorporales[nuevoId] = datosFicha;

    actualizarSQLConsola("INSERT_SOCIO", { ...nuevoSocio, ficha: datosFicha });
    alert("Socio registrado de manera exitosa en el sistema.");
  } else {
    // EDICIÓN DE SOCIO
    const idNum = parseInt(idSocio);
    const index = socios.findIndex(s => s.id === idNum);
    
    if (index !== -1) {
      socios[index].nombre = nombre;
      socios[index].telefono = telefono;
      socios[index].email = email;
      socios[index].membresiaId = membresiaId;
      socios[index].fecha = fecha;
      socios[index].estado = estado;
      
      // Actualizamos también su ficha física
      fichasCorporales[idNum] = datosFicha;

      actualizarSQLConsola("UPDATE_SOCIO", socios[index]);
      alert("Registro de socio actualizado correctamente.");
    }
  }

  guardarBD();
  resetSocioForm();
  actualizarVistaDashboard();
}

/**
 * Carga un socio en el formulario para editarlo
 * @param {number} id - ID del socio a editar
 */
function editSocio(id) {
  const socio = socios.find(s => s.id === id);
  if (!socio) return;

  document.getElementById("socio-id").value = socio.id;
  document.getElementById("socio-nombre").value = socio.nombre;
  document.getElementById("socio-telefono").value = socio.telefono;
  document.getElementById("socio-email").value = socio.email;
  document.getElementById("socio-membresia").value = socio.membresiaId;
  document.getElementById("socio-fecha").value = socio.fecha;
  document.getElementById("socio-estado").value = socio.estado;

  // Llenamos la ficha física si existe
  const ficha = fichasCorporales[id];
  if (ficha) {
    document.getElementById("socio-peso").value = ficha.peso;
    document.getElementById("socio-estatura").value = ficha.estatura;
    document.getElementById("socio-grasa").value = ficha.grasa;
    document.getElementById("socio-musculo").value = ficha.musculo;
    document.getElementById("socio-antecedentes").value = ficha.antecedentes;
  } else {
    document.getElementById("socio-peso").value = "";
    document.getElementById("socio-estatura").value = "";
    document.getElementById("socio-grasa").value = "";
    document.getElementById("socio-musculo").value = "";
    document.getElementById("socio-antecedentes").value = "";
  }

  // Modificamos el título del formulario
  document.getElementById("socio-form-title").innerText = "Editar Datos de Socio: " + socio.nombre;
  document.getElementById("btn-save-socio").innerText = "Guardar Cambios";
  
  // Hacemos scroll suave hacia el formulario en móviles
  document.getElementById("form-socio").scrollIntoView({ behavior: "smooth" });
}

/**
 * Elimina un socio de la base de datos
 * @param {number} id - ID del socio
 */
function deleteSocio(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este socio? Esto también borrará sus pagos e historial físico.")) {
    socios = socios.filter(s => s.id !== id);
    delete fichasCorporales[id];
    pagosCaja = pagosCaja.filter(p => p.socioId !== id);
    rutinasAsignadas = rutinasAsignadas.filter(r => r.socioId !== id);
    
    actualizarSQLConsola("DELETE_SOCIO", { id: id });
    guardarBD();
    actualizarVistaDashboard();
  }
}

/**
 * Limpia el formulario de socios y lo regresa a su estado inicial
 */
function resetSocioForm() {
  document.getElementById("socio-id").value = "";
  document.getElementById("form-socio").reset();
  document.getElementById("socio-form-title").innerText = "Registrar Nuevo Socio";
  document.getElementById("btn-save-socio").innerText = "Guardar Registro";
  
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById("socio-fecha").value = hoy;
}

/**
 * Calcula el Índice de Masa Corporal (IMC) y el rango saludable
 * IMC = peso (kg) / estatura^2 (m)
 */
function calcularIMC(peso, estaturaCm) {
  if (!peso || !estaturaCm) return null;
  const estaturaMetros = estaturaCm / 100;
  const imc = peso / (estaturaMetros * estaturaMetros);
  
  let estado = "";
  let color = "";

  if (imc < 18.5) {
    estado = "Bajo peso";
    color = "var(--warning)";
  } else if (imc >= 18.5 && imc < 25) {
    estado = "Normal";
    color = "var(--success)";
  } else if (imc >= 25 && imc < 30) {
    estado = "Sobrepeso";
    color = "var(--warning)";
  } else {
    estado = "Obesidad";
    color = "var(--danger)";
  }

  return {
    valor: imc.toFixed(1),
    rango: estado,
    color: color
  };
}

/**
 * Abre el modal y muestra la Ficha Corporal e IMC del socio seleccionado
 * @param {number} id - ID del socio
 */
function viewFichaCorporal(id) {
  const socio = socios.find(s => s.id === id);
  const ficha = fichasCorporales[id];

  if (!socio) return;

  const modal = document.getElementById("modal-ficha-corporal");
  const title = document.getElementById("modal-ficha-title");
  const body = document.getElementById("modal-ficha-body");

  title.innerText = "Historial Corporal — " + socio.nombre;

  if (!ficha || (!ficha.peso && !ficha.estatura)) {
    body.innerHTML = `<p style="text-align:center; color:var(--text-muted);">El socio no tiene medidas físicas iniciales registradas en su ficha.</p>`;
  } else {
    const imcResult = calcularIMC(ficha.peso, ficha.estatura);
    
    let html = `
      <div style="display:flex; flex-direction:column; gap:15px;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div style="background:var(--bg-input); padding:10px; border-radius:8px;">
            <p style="font-size:0.75rem; color:var(--text-muted);">Peso Corporal</p>
            <p style="font-size:1.25rem; font-weight:bold; color:var(--text-main);">${ficha.peso} kg</p>
          </div>
          <div style="background:var(--bg-input); padding:10px; border-radius:8px;">
            <p style="font-size:0.75rem; color:var(--text-muted);">Estatura</p>
            <p style="font-size:1.25rem; font-weight:bold; color:var(--text-main);">${ficha.estatura} cm</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div style="background:var(--bg-input); padding:10px; border-radius:8px;">
            <p style="font-size:0.75rem; color:var(--text-muted);">Grasa Corporal</p>
            <p style="font-size:1.25rem; font-weight:bold; color:var(--text-main);">${ficha.grasa || "-"} %</p>
          </div>
          <div style="background:var(--bg-input); padding:10px; border-radius:8px;">
            <p style="font-size:0.75rem; color:var(--text-muted);">Masa Muscular</p>
            <p style="font-size:1.25rem; font-weight:bold; color:var(--text-main);">${ficha.musculo || "-"} %</p>
          </div>
        </div>
    `;

    if (imcResult) {
      html += `
        <div style="border: 1px solid var(--input-border); border-radius:10px; padding:15px; text-align:center; background-color: rgba(var(--accent-rgb), 0.02);">
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:5px;">Índice de Masa Corporal (IMC)</p>
          <p style="font-size:2.25rem; font-weight:800; color:var(--accent); line-height:1;">${imcResult.valor}</p>
          <span style="display:inline-block; margin-top:8px; font-size:0.8rem; font-weight:bold; padding:2px 12px; border-radius:12px; background-color:${imcResult.color}; color:white;">
            Rango: ${imcResult.rango}
          </span>
        </div>
      `;
    }

    html += `
        <div style="background:var(--bg-input); padding:12px; border-radius:8px;">
          <h4 style="font-size:0.85rem; margin-bottom:5px;">Antecedentes y Notas Médicas:</h4>
          <p style="font-size:0.8rem; color:var(--text-sub); line-height:1.4;">${ficha.antecedentes || "Ninguno registrado."}</p>
        </div>
      </div>
    `;

    body.innerHTML = html;
  }

  modal.classList.add("active-modal");
}

function closeFichaModal() {
  document.getElementById("modal-ficha-corporal").classList.remove("active-modal");
}

// --------------------------------------------------------------------------
// 8. GESTIÓN DE MENSUALIDADES (PAGOS Y CAJA)
// --------------------------------------------------------------------------

/**
 * Procesa el formulario para registrar un pago nuevo en caja
 */
function handlePagoSubmit(event) {
  event.preventDefault();
  
  const socioId = parseInt(document.getElementById("pago-socio-id").value);
  const monto = parseFloat(document.getElementById("pago-monto").value);
  const metodo = document.getElementById("pago-metodo").value;
  const fecha = document.getElementById("pago-fecha").value;

  const socio = socios.find(s => s.id === socioId);
  if (!socio) return;

  const nuevoId = pagosCaja.length > 0 ? Math.max(...pagosCaja.map(p => p.id)) + 1 : 1;
  const nuevoPago = {
    id: nuevoId,
    socioId: socioId,
    monto: monto,
    fecha: fecha,
    metodo: metodo
  };

  pagosCaja.push(nuevoPago);
  
  // Al registrar el pago, activamos automáticamente el estado de membresía del socio
  const socioIndex = socios.findIndex(s => s.id === socioId);
  if (socioIndex !== -1) {
    socios[socioIndex].estado = "Activo";
  }

  actualizarSQLConsola("INSERT_PAGO", nuevoPago);
  guardarBD();
  alert(`Pago registrado correctamente. Socio '${socio.nombre}' se encuentra ahora Activo.`);
  
  document.getElementById("form-pago").reset();
  
  // Seteamos fecha de hoy por defecto de nuevo
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById("pago-fecha").value = hoy;

  actualizarVistaDashboard();
}

/**
 * Elimina un registro de pago
 */
function deletePago(id) {
  if (confirm("¿Deseas anular esta transacción de pago de mensualidad?")) {
    pagosCaja = pagosCaja.filter(p => p.id !== id);
    guardarBD();
    actualizarVistaDashboard();
  }
}

// --------------------------------------------------------------------------
// 9. GESTIÓN DE RUTINAS Y CATÁLOGO DE EJERCICIOS
// --------------------------------------------------------------------------

/**
 * Renderiza los checkboxes de los ejercicios del catálogo en la vista de asignación
 */
function renderizarCatalogoEjercicios() {
  const container = document.getElementById("catalog-exercises-container");
  if (!container) return;

  container.innerHTML = catalogoEjercicios.map(e => `
    <div class="exercise-item-card">
      <div class="exercise-header-meta">
        <span class="muscle-badge">${e.grupo}</span>
      </div>
      <span class="exercise-title">${e.nombre}</span>
      <p class="exercise-desc">${e.desc}</p>
      <label class="exercise-checkbox-label">
        <input type="checkbox" name="rutina-ejercicio" value="${e.nombre}" style="accent-color: var(--accent);"> Seleccionar
      </label>
    </div>
  `).join('');
}

/**
 * Procesa la asignación de una rutina a un socio
 */
function handleRutinaSubmit(event) {
  event.preventDefault();
  
  const socioId = parseInt(document.getElementById("rutina-socio-id").value);
  const grupo = document.getElementById("rutina-grupo").value.trim();
  const fecha = document.getElementById("rutina-fecha").value;

  // Obtenemos los ejercicios seleccionados
  const checkboxes = document.querySelectorAll("input[name='rutina-ejercicio']:checked");
  if (checkboxes.length === 0) {
    alert("Por favor selecciona al menos un ejercicio del catálogo.");
    return;
  }

  const listaEjercicios = Array.from(checkboxes).map(cb => cb.value).join(", ");

  const nuevoId = rutinasAsignadas.length > 0 ? Math.max(...rutinasAsignadas.map(r => r.id)) + 1 : 1;
  const nuevaRutina = {
    id: nuevoId,
    socioId: socioId,
    grupo: grupo,
    ejercicios: listaEjercicios,
    fechaAsignada: fecha
  };

  // Eliminamos rutinas anteriores de este mismo grupo para este socio (reemplazo)
  rutinasAsignadas = rutinasAsignadas.filter(r => !(r.socioId === socioId && r.grupo.toLowerCase() === grupo.toLowerCase()));

  rutinasAsignadas.push(nuevaRutina);

  actualizarSQLConsola("INSERT_RUTINA", nuevaRutina);
  guardarBD();
  alert("Rutina de entrenamiento asignada y guardada con éxito.");

  // Limpiamos los checkboxes y formulario
  document.getElementById("form-rutina").reset();
  document.querySelectorAll("input[name='rutina-ejercicio']:checked").forEach(cb => cb.checked = false);
  const hoy = new Date().toISOString().split('T')[0];
  document.getElementById("rutina-fecha").value = hoy;

  actualizarVistaDashboard();
}

/**
 * Elimina una rutina asignada
 */
function deleteRutina(id) {
  if (confirm("¿Deseas desvincular o eliminar esta rutina de entrenamiento?")) {
    rutinasAsignadas = rutinasAsignadas.filter(r => r.id !== id);
    guardarBD();
    actualizarVistaDashboard();
  }
}

// --------------------------------------------------------------------------
// 10. REPORTE / ESTADÍSTICAS (GENERACIÓN DINÁMICA DE SVG)
// --------------------------------------------------------------------------

/**
 * Genera y actualiza los gráficos SVG del dashboard usando la información actual
 */
function actualizarGraficasSVG() {
  const container = document.getElementById("chart-bars-income-container");
  if (!container) return;

  // Calculamos ingresos
  const ingresosMesActual = pagosCaja.reduce((acc, p) => acc + p.monto, 0);
  // Supongamos ingresos de un mes anterior simulado (si no hay pagos es 0)
  const ingresosMesAnterior = 420000; // Valor de base comparativo simulado

  // Altura base del gráfico SVG es de 140px máximo (y=170 es el suelo, y=30 es el techo)
  const alturaMax = 140;
  const ingresosMax = Math.max(ingresosMesActual, ingresosMesAnterior, 1000000);

  const alturaBarra1 = (ingresosMesAnterior / ingresosMax) * alturaMax;
  const alturaBarra2 = (ingresosMesActual / ingresosMax) * alturaMax;

  const yBarra1 = 170 - alturaBarra1;
  const yBarra2 = 170 - alturaBarra2;

  // Inyectamos las barras en SVG
  container.innerHTML = `
    <!-- Barra Mes Anterior -->
    <rect x="100" y="${yBarra1}" width="50" height="${alturaBarra1}" fill="#cbd5e1" rx="4">
      <title>Mes Anterior: $${ingresosMesAnterior.toLocaleString()}</title>
    </rect>
    <text x="125" y="${yBarra1 - 8}" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">$${(ingresosMesAnterior/1000).toFixed(0)}k</text>

    <!-- Barra Mes Actual -->
    <rect x="230" y="${yBarra2}" width="50" height="${alturaBarra2}" fill="var(--accent)" rx="4">
      <title>Mes Actual: $${ingresosMesActual.toLocaleString()}</title>
    </rect>
    <text x="255" y="${yBarra2 - 8}" font-size="10" font-weight="bold" fill="var(--accent)" text-anchor="middle">$${(ingresosMesActual/1000).toFixed(0)}k</text>
  `;
}

// --------------------------------------------------------------------------
// 11. CONFIGURACIÓN Y PERFIL DEL ADMINISTRADOR
// --------------------------------------------------------------------------

/**
 * Actualiza la información del perfil administrador
 */
function handleProfileUpdate(event) {
  event.preventDefault();
  const nombre = document.getElementById("conf-nombre").value.trim();
  const email = document.getElementById("conf-email").value.trim();
  const pass = document.getElementById("conf-password").value;

  // Modificamos al admin en memoria
  administrador[0].nombre = nombre;
  administrador[0].email = email;
  if (pass !== "") {
    administrador[0].contrasena = pass;
  }

  // Guardamos cambios
  localStorage.setItem("active_user", JSON.stringify(administrador[0]));
  guardarBD();
  alert("Datos de perfil del administrador actualizados con éxito.");
  comprobarEstadoSesion();
}

/**
 * Actualiza los precios de las membresías en la configuración
 */
function handleRatesUpdate(event) {
  event.preventDefault();
  const m1Price = parseFloat(document.getElementById("rate-mensual").value);
  const m2Price = parseFloat(document.getElementById("rate-trimestral").value);
  const m3Price = parseFloat(document.getElementById("rate-anual").value);

  configuracionTarifas.m1.precio = m1Price;
  configuracionTarifas.m2.precio = m2Price;
  configuracionTarifas.m3.precio = m3Price;

  actualizarSQLConsola("UPDATE_TARIFAS", { m1: m1Price, m2: m2Price, m3: m3Price });
  guardarBD();
  alert("Precios de membresías del catálogo actualizados correctamente.");
}

// --------------------------------------------------------------------------
// 12. RENDERIZADORES DE VISTAS (TABLAS Y LISTADOS DINÁMICOS)
// --------------------------------------------------------------------------

/**
 * Llena los dropdown de selección de socios en otras pestañas
 */
function actualizarDropdownsSocios() {
  const paymentSelect = document.getElementById("pago-socio-id");
  const routineSelect = document.getElementById("rutina-socio-id");

  if (!paymentSelect || !routineSelect) return;

  if (socios.length === 0) {
    paymentSelect.innerHTML = `<option value="">-- No hay socios registrados --</option>`;
    routineSelect.innerHTML = `<option value="">-- No hay socios registrados --</option>`;
    return;
  }

  const opciones = socios.map(s => `<option value="${s.id}">${s.nombre} (ID: #${s.id})</option>`).join('');
  paymentSelect.innerHTML = opciones;
  routineSelect.innerHTML = opciones;
}

/**
 * Actualiza la información visual de todas las secciones del Dashboard administrativo
 */
function actualizarVistaDashboard() {
  // 1. KPIs numéricos de la vista de resumen
  const totalSocios = socios.length;
  const activos = socios.filter(s => s.estado === "Activo").length;
  const vencidos = socios.filter(s => s.estado === "Vencido").length;
  const totalCaja = pagosCaja.reduce((acc, p) => acc + p.monto, 0);

  document.getElementById("kpi-total-socios").innerText = totalSocios;
  document.getElementById("kpi-active-socios").innerText = activos;
  document.getElementById("kpi-expired-socios").innerText = vencidos;
  document.getElementById("kpi-monthly-income").innerText = "$" + totalCaja.toLocaleString('es-CO');

  // 2. Tabla de socios recientes en el panel de control
  const kpiRecentTable = document.getElementById("kpi-recent-members-table");
  if (kpiRecentTable) {
    if (socios.length === 0) {
      kpiRecentTable.innerHTML = `<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No hay socios registrados en el sistema. Registra uno en la sección de Socios.</td></tr>`;
    } else {
      kpiRecentTable.innerHTML = socios.map(s => {
        const plan = configuracionTarifas[s.membresiaId]?.tipo || "Personalizado";
        let badgeClass = "pending";
        if (s.estado === "Activo") badgeClass = "active";
        if (s.estado === "Vencido") badgeClass = "expired";
        
        return `
          <tr>
            <td style="font-weight:600;">${s.nombre}</td>
            <td>${plan}</td>
            <td>${s.fecha}</td>
            <td><span class="badge-status ${badgeClass}">${s.estado}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  // 3. Tabla CRUD del listado completo de socios
  const sociosListBody = document.getElementById("socios-list-body");
  if (sociosListBody) {
    if (socios.length === 0) {
      sociosListBody.innerHTML = `<tr><td colspan="3" style="text-align:center; color:var(--text-muted); padding: 1.5rem;">Caja de socios vacía. Agrega tu primer registro a la izquierda.</td></tr>`;
    } else {
      sociosListBody.innerHTML = socios.map(s => {
        let badgeClass = "pending";
        if (s.estado === "Activo") badgeClass = "active";
        if (s.estado === "Vencido") badgeClass = "expired";

        return `
          <tr>
            <td>
              <div style="font-weight:600; color:var(--text-main);">${s.nombre}</div>
              <div style="font-size:0.75rem; color:var(--text-muted);">${s.email}</div>
            </td>
            <td><span class="badge-status ${badgeClass}">${s.estado}</span></td>
            <td>
              <div style="display:flex; gap:6px;">
                <button class="btn-dash btn-dash-secondary btn-dash-sm" onclick="editSocio(${s.id})" title="Editar"><i class="ti ti-edit"></i></button>
                <button class="btn-dash btn-dash-secondary btn-dash-sm" onclick="viewFichaCorporal(${s.id})" title="Ver Ficha Corporal"><i class="ti ti-activity-heartbeat"></i></button>
                <button class="btn-dash btn-dash-danger btn-dash-sm" onclick="deleteSocio(${s.id})" title="Eliminar"><i class="ti ti-trash"></i></button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 4. Tabla del historial de pagos
  const pagosListBody = document.getElementById("pagos-list-body");
  if (pagosListBody) {
    if (pagosCaja.length === 0) {
      pagosListBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding: 1.5rem;">Ningún ingreso registrado en caja por el momento.</td></tr>`;
    } else {
      pagosListBody.innerHTML = pagosCaja.map(p => {
        const socio = socios.find(s => s.id === p.socioId);
        const socioNombre = socio ? socio.nombre : "Socio Eliminado";
        return `
          <tr>
            <td>#P-${p.id}</td>
            <td style="font-weight:600;">${socioNombre}</td>
            <td style="font-weight:bold; color:var(--success);">$${p.monto.toLocaleString('es-CO')}</td>
            <td>${p.metodo}</td>
            <td>${p.fecha}</td>
            <td>
              <button class="btn-dash btn-dash-danger btn-dash-sm" onclick="deletePago(${p.id})"><i class="ti ti-trash"></i></button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 5. Listado de rutinas asignadas
  const rutinasContainer = document.getElementById("rutinas-list-container");
  if (rutinasContainer) {
    if (rutinasAsignadas.length === 0) {
      rutinasContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 2rem;">No hay planes de entrenamiento activos. Asigna uno a la izquierda.</p>`;
    } else {
      rutinasContainer.innerHTML = rutinasAsignadas.map(r => {
        const socio = socios.find(s => s.id === r.socioId);
        const socioNombre = socio ? socio.nombre : "Socio Eliminado";
        return `
          <div style="background-color:var(--bg-input); border: 1px solid var(--input-border); border-radius:10px; padding:1.25rem; margin-bottom:1rem; position:relative;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
              <div>
                <h4 style="font-size:0.95rem; color:var(--text-main); font-weight:700;">${socioNombre}</h4>
                <p style="font-size:0.75rem; color:var(--text-muted);">Enfoque: <span style="font-weight:bold; color:var(--accent);">${r.grupo}</span></p>
              </div>
              <button onclick="deleteRutina(${r.id})" style="background:transparent; border:none; color:var(--danger); cursor:pointer; font-size:1.1rem;"><i class="ti ti-trash"></i></button>
            </div>
            <p style="font-size:0.8rem; color:var(--text-sub); line-height:1.4; background:var(--bg-card); border-radius:6px; padding:8px; border:1px dashed var(--input-border); margin-top:5px;">
              <strong>Ejercicios:</strong> ${r.ejercicios}
            </p>
            <div style="font-size:0.7rem; color:var(--text-muted); text-align:right; margin-top:8px;">
              Asignado el: ${r.fechaAsignada}
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Renderizamos de nuevo las gráficas SVG
  actualizarGraficasSVG();
}

// --------------------------------------------------------------------------
// 13. ACCIONES GENERALES Y SIMULACIONES PÚBLICAS
// --------------------------------------------------------------------------

/**
 * Controla el formulario de contacto público de la Landing Page
 */
function handleLandingContactSubmit(event) {
  event.preventDefault();
  const nombre = document.getElementById("c-name").value;
  alert(`¡Gracias, ${nombre}! Tu mensaje ha sido simulado de manera exitosa. En un entorno real, esto enviaría un correo o registraría tu solicitud en la base de datos.`);
  document.getElementById("landing-contact-form").reset();
}
