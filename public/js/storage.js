/**
 * ==========================================================================
 * CAPA DE DATOS — GYM CONTROL (IRON HABIT GYM)
 * Ficha 3186630 · SENA Centro de Servicios Financieros
 *
 * Este archivo simula la base de datos del sistema usando localStorage.
 * Es compartido por login.html y dashboard.html (y por cualquier fragmento
 * que se cargue dentro del dashboard), por eso vive en un archivo aparte:
 * así todas las páginas "ven" siempre la misma información sin duplicar código.
 * ==========================================================================
 */

// --------------------------------------------------------------------------
// 1. ESTRUCTURAS DE DATOS SEMILLA (SIMULACIÓN DE TABLAS DE BASE DE DATOS)
// --------------------------------------------------------------------------

const membresiasPredefinidas = {
  m1: { id: "m1", tipo: "Plan Mensual General", precio: 120000, duracion: "1 Mes" },
  m2: { id: "m2", tipo: "Plan Trimestral", precio: 320000, duracion: "3 Meses" },
  m3: { id: "m3", tipo: "Plan Anual VIP", precio: 1000000, duracion: "1 Año" }
};

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

const administradorPorDefecto = [
  { id: "u1", nombre: "Yerson Valera", email: "yerson@control.com", contrasena: "admin123", rol: "Administrador" }
];

// --------------------------------------------------------------------------
// 2. INICIALIZACIÓN DE LA PERSISTENCIA (LOCALSTORAGE)
// --------------------------------------------------------------------------

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
// 3. CONSOLA PEDAGÓGICA (SQL FEEDBACK PARA EL SENA)
// --------------------------------------------------------------------------

/**
 * Imprime en la consola del Dashboard la consulta SQL que se ejecutaría
 * en MySQL Workbench para insertar o actualizar la información correspondiente.
 * @param {string} accion
 * @param {object} datos
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
// 4. UTILIDAD: CÁLCULO DE IMC (compartida por el modal de ficha corporal)
// --------------------------------------------------------------------------

/**
 * Calcula el Índice de Masa Corporal (IMC) y el rango saludable
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

  return { valor: imc.toFixed(1), rango: estado, color: color };
}
