/**
 * ==========================================================================
 * PESTAÑA: CONFIGURACIÓN — sections/configuracion.html
 * initTabConfiguracion() se ejecuta cada vez que dashboard.js inserta este fragmento.
 * ==========================================================================
 */
function initTabConfiguracion() {
  const formPerfil = document.getElementById("form-config-perfil");
  const formTarifas = document.getElementById("form-config-tarifas");

  // Pintamos los datos actuales del administrador y las tarifas vigentes
  const user = JSON.parse(localStorage.getItem("active_user")) || administrador[0];
  document.getElementById("conf-nombre").value = user.nombre;
  document.getElementById("conf-email").value = user.email;

  document.getElementById("rate-mensual").value = configuracionTarifas.m1.precio;
  document.getElementById("rate-trimestral").value = configuracionTarifas.m2.precio;
  document.getElementById("rate-anual").value = configuracionTarifas.m3.precio;

  activarLimpiezaDeErroresEnVivo(formPerfil);
  activarLimpiezaDeErroresEnVivo(formTarifas);

  formPerfil.addEventListener("submit", handleProfileUpdate);
  formTarifas.addEventListener("submit", handleRatesUpdate);
}

function handleProfileUpdate(event) {
  event.preventDefault();
  const form = event.target;

  if (!validarFormulario(form)) {
    mostrarToast("Revisa los campos del perfil antes de guardar.", "warning");
    return;
  }

  const nombre = document.getElementById("conf-nombre").value.trim();
  const email = document.getElementById("conf-email").value.trim();
  const pass = document.getElementById("conf-password").value;

  administrador[0].nombre = nombre;
  administrador[0].email = email;
  if (pass !== "") administrador[0].contrasena = pass;

  localStorage.setItem("active_user", JSON.stringify(administrador[0]));
  guardarBD();
  mostrarToast("Datos de perfil del administrador actualizados con éxito.", "success");
  document.getElementById("conf-password").value = "";

  pintarDatosUsuarioActivo();
}

function handleRatesUpdate(event) {
  event.preventDefault();
  const form = event.target;

  if (!validarFormulario(form)) {
    mostrarToast("Revisa los precios ingresados antes de guardar.", "warning");
    return;
  }

  const m1Price = parseFloat(document.getElementById("rate-mensual").value);
  const m2Price = parseFloat(document.getElementById("rate-trimestral").value);
  const m3Price = parseFloat(document.getElementById("rate-anual").value);

  configuracionTarifas.m1.precio = m1Price;
  configuracionTarifas.m2.precio = m2Price;
  configuracionTarifas.m3.precio = m3Price;

  actualizarSQLConsola("UPDATE_TARIFAS", { m1: m1Price, m2: m2Price, m3: m3Price });
  guardarBD();
  mostrarToast("Precios de membresías del catálogo actualizados correctamente.", "success");
}
