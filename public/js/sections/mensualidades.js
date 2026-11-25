/**
 * ==========================================================================
 * PESTAÑA: MENSUALIDADES Y CAJA — sections/mensualidades.html
 * initTabMensualidades() se ejecuta cada vez que dashboard.js inserta este fragmento.
 * ==========================================================================
 */
const AUTOSAVE_KEY_PAGO = "draft_form_pago";

function initTabMensualidades() {
  const form = document.getElementById("form-pago");

  document.getElementById("pago-fecha").value = fechaHoyISO();
  llenarDropdownSociosPago();

  const huboBorrador = restaurarAutosave(form, AUTOSAVE_KEY_PAGO);
  if (huboBorrador) mostrarToast("Se restauró el borrador del recibo que estabas llenando.", "info");

  activarAutosave(form, AUTOSAVE_KEY_PAGO);
  activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", handlePagoSubmit);

  renderizarListaPagos();
}

function llenarDropdownSociosPago() {
  const select = document.getElementById("pago-socio-id");
  if (!select) return;

  if (socios.length === 0) {
    select.innerHTML = `<option value="">-- No hay socios registrados --</option>`;
    return;
  }
  select.innerHTML = socios.map(s => `<option value="${s.id}">${s.nombre} (ID: #${s.id})</option>`).join('');
}

function handlePagoSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (!validarFormulario(form)) {
    mostrarToast("Revisa los campos del recibo antes de confirmar la transacción.", "warning");
    return;
  }

  const socioId = parseInt(document.getElementById("pago-socio-id").value);
  const monto = parseFloat(document.getElementById("pago-monto").value);
  const metodo = document.getElementById("pago-metodo").value;
  const fecha = document.getElementById("pago-fecha").value;

  const socio = socios.find(s => s.id === socioId);
  if (!socio) {
    mostrarToast("Selecciona un socio válido antes de registrar el pago.", "warning");
    return;
  }

  const nuevoId = pagosCaja.length > 0 ? Math.max(...pagosCaja.map(p => p.id)) + 1 : 1;
  const nuevoPago = { id: nuevoId, socioId, monto, fecha, metodo };
  pagosCaja.push(nuevoPago);

  const socioIndex = socios.findIndex(s => s.id === socioId);
  if (socioIndex !== -1) socios[socioIndex].estado = "Activo";

  actualizarSQLConsola("INSERT_PAGO", nuevoPago);
  guardarBD();
  mostrarToast(`Pago registrado correctamente. '${socio.nombre}' se encuentra ahora Activo.`, "success");

  limpiarAutosave(AUTOSAVE_KEY_PAGO);
  form.reset();
  document.getElementById("pago-fecha").value = fechaHoyISO();
  llenarDropdownSociosPago();

  renderizarListaPagos();
}

async function deletePago(id) {
  const confirmado = await confirmarAccion("¿Deseas anular esta transacción de pago de mensualidad?");
  if (!confirmado) return;

  pagosCaja = pagosCaja.filter(p => p.id !== id);
  guardarBD();
  renderizarListaPagos();
  mostrarToast("Transacción anulada.", "success");
}

function renderizarListaPagos() {
  const pagosListBody = document.getElementById("pagos-list-body");
  if (!pagosListBody) return;

  if (pagosCaja.length === 0) {
    pagosListBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding: 1.5rem;">Ningún ingreso registrado en caja por el momento.</td></tr>`;
    return;
  }

  pagosListBody.innerHTML = pagosCaja.map(p => {
    const socio = socios.find(s => s.id === p.socioId);
    const socioNombre = socio ? socio.nombre : "Socio Eliminado";
    return `
      <tr>
        <td>#P-${p.id}</td>
        <td style="font-weight:600;">${socioNombre}</td>
        <td style="font-weight:bold; color:var(--success);">${formatearMoneda(p.monto)}</td>
        <td>${p.metodo}</td>
        <td>${p.fecha}</td>
        <td>
          <button class="btn-dash btn-dash-danger btn-dash-sm" onclick="deletePago(${p.id})"><i class="ti ti-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}
