/**
 * ==========================================================================
 * PESTAÑA: GESTIÓN DE SOCIOS — sections/socios.html
 * initTabSocios() se ejecuta cada vez que dashboard.js inserta este fragmento.
 * ==========================================================================
 */
const AUTOSAVE_KEY_SOCIO = "draft_form_socio";

function initTabSocios() {
  const form = document.getElementById("form-socio");

  // Fecha de hoy por defecto (solo si no hay un borrador que ya la haya llenado)
  document.getElementById("socio-fecha").value = fechaHoyISO();

  // Restauramos el borrador si el usuario refrescó por accidente mientras llenaba el formulario
  const huboBorrador = restaurarAutosave(form, AUTOSAVE_KEY_SOCIO);
  if (huboBorrador) mostrarToast("Se restauró el borrador que estabas llenando.", "info");

  activarAutosave(form, AUTOSAVE_KEY_SOCIO);
  activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", handleSocioSubmit);
  document.getElementById("btn-cancel-socio").addEventListener("click", resetSocioForm);

  renderizarListaSocios();
}

function handleSocioSubmit(event) {
  event.preventDefault();
  const form = event.target;

  if (!validarFormulario(form)) {
    mostrarToast("Revisa los campos marcados para poder registrar al socio.", "warning");
    return;
  }

  const idSocio = document.getElementById("socio-id").value;
  const nombre = document.getElementById("socio-nombre").value.trim();
  const telefono = document.getElementById("socio-telefono").value.trim();
  const email = document.getElementById("socio-email").value.trim();
  const membresiaId = document.getElementById("socio-membresia").value;
  const fecha = document.getElementById("socio-fecha").value;
  const estado = document.getElementById("socio-estado").value;

  const datosFicha = {
    peso: document.getElementById("socio-peso").value,
    estatura: document.getElementById("socio-estatura").value,
    grasa: document.getElementById("socio-grasa").value,
    musculo: document.getElementById("socio-musculo").value,
    antecedentes: document.getElementById("socio-antecedentes").value.trim() || "Ninguno"
  };

  if (idSocio === "") {
    const nuevoId = socios.length > 0 ? Math.max(...socios.map(s => s.id)) + 1 : 1;
    const nuevoSocio = { id: nuevoId, nombre, telefono, email, membresiaId, fecha, estado };

    socios.push(nuevoSocio);
    fichasCorporales[nuevoId] = datosFicha;

    actualizarSQLConsola("INSERT_SOCIO", { ...nuevoSocio, ficha: datosFicha });
    mostrarToast("Socio registrado exitosamente en el sistema.", "success");
  } else {
    const idNum = parseInt(idSocio);
    const index = socios.findIndex(s => s.id === idNum);

    if (index !== -1) {
      Object.assign(socios[index], { nombre, telefono, email, membresiaId, fecha, estado });
      fichasCorporales[idNum] = datosFicha;

      actualizarSQLConsola("UPDATE_SOCIO", socios[index]);
      mostrarToast("Registro de socio actualizado correctamente.", "success");
    }
  }

  guardarBD();
  limpiarAutosave(AUTOSAVE_KEY_SOCIO);
  resetSocioForm();
  renderizarListaSocios();
}

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

  const ficha = fichasCorporales[id];
  document.getElementById("socio-peso").value = ficha ? ficha.peso : "";
  document.getElementById("socio-estatura").value = ficha ? ficha.estatura : "";
  document.getElementById("socio-grasa").value = ficha ? ficha.grasa : "";
  document.getElementById("socio-musculo").value = ficha ? ficha.musculo : "";
  document.getElementById("socio-antecedentes").value = ficha ? ficha.antecedentes : "";

  document.getElementById("socio-form-title").innerText = "Editar Datos de Socio: " + socio.nombre;
  document.getElementById("btn-save-socio").innerText = "Guardar Cambios";

  document.getElementById("form-socio").scrollIntoView({ behavior: "smooth" });
}

async function deleteSocio(id) {
  const confirmado = await confirmarAccion("¿Estás seguro de que deseas eliminar este socio? Esto también borrará sus pagos e historial físico.");
  if (!confirmado) return;

  socios = socios.filter(s => s.id !== id);
  delete fichasCorporales[id];
  pagosCaja = pagosCaja.filter(p => p.socioId !== id);
  rutinasAsignadas = rutinasAsignadas.filter(r => r.socioId !== id);

  actualizarSQLConsola("DELETE_SOCIO", { id });
  guardarBD();
  renderizarListaSocios();
  mostrarToast("Socio eliminado del sistema.", "success");
}

function resetSocioForm() {
  document.getElementById("socio-id").value = "";
  document.getElementById("form-socio").reset();
  document.getElementById("socio-form-title").innerText = "Registrar Nuevo Socio";
  document.getElementById("btn-save-socio").innerText = "Guardar Registro";
  document.getElementById("socio-fecha").value = fechaHoyISO();

  document.querySelectorAll("#form-socio .field-invalid").forEach(el => el.classList.remove("field-invalid"));
  document.querySelectorAll("#form-socio .field-error-msg").forEach(el => el.textContent = "");
}

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

function renderizarListaSocios() {
  const sociosListBody = document.getElementById("socios-list-body");
  if (!sociosListBody) return;

  const badgeCount = document.getElementById("socios-count-badge");
  if (badgeCount) badgeCount.innerText = socios.length + (socios.length === 1 ? " socio" : " socios");

  if (socios.length === 0) {
    sociosListBody.innerHTML = `<div class="mini-list-empty">Caja de socios vacía. Agrega tu primer registro a la izquierda.</div>`;
    return;
  }

  sociosListBody.innerHTML = socios.map(s => {
    let badgeClass = "pending";
    if (s.estado === "Activo") badgeClass = "active";
    if (s.estado === "Vencido") badgeClass = "expired";

    const iniciales = s.nombre.trim().split(/\s+/).map(n => n[0]).join("").toUpperCase().slice(0, 2);

    return `
      <div class="mini-list-item">
        <div class="mini-list-avatar">${iniciales}</div>
        <div class="mini-list-info">
          <p class="mini-list-name" title="${s.nombre}">${s.nombre}</p>
          <p class="mini-list-sub" title="${s.email}">${s.email}</p>
        </div>
        <div class="mini-list-right">
          <span class="badge-status ${badgeClass}">${s.estado}</span>
          <div class="mini-list-actions">
            <button class="btn-dash btn-dash-secondary btn-dash-icon" onclick="editSocio(${s.id})" title="Editar"><i class="ti ti-edit"></i></button>
            <button class="btn-dash btn-dash-secondary btn-dash-icon" onclick="viewFichaCorporal(${s.id})" title="Ver Ficha Corporal"><i class="ti ti-activity-heartbeat"></i></button>
            <button class="btn-dash btn-dash-danger btn-dash-icon" onclick="deleteSocio(${s.id})" title="Eliminar"><i class="ti ti-trash"></i></button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
