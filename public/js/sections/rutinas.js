/**
 * ==========================================================================
 * PESTAÑA: RUTINAS DE ENTRENAMIENTO — sections/rutinas.html
 * initTabRutinas() se ejecuta cada vez que dashboard.js inserta este fragmento.
 * ==========================================================================
 */
const AUTOSAVE_KEY_RUTINA = "draft_form_rutina";

function initTabRutinas() {
  const form = document.getElementById("form-rutina");

  document.getElementById("rutina-fecha").value = fechaHoyISO();
  llenarDropdownSociosRutina();
  renderizarCatalogoEjercicios();

  const huboBorrador = restaurarAutosave(form, AUTOSAVE_KEY_RUTINA);
  if (huboBorrador) mostrarToast("Se restauró el borrador de la rutina que estabas asignando.", "info");

  activarAutosave(form, AUTOSAVE_KEY_RUTINA);
  activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", handleRutinaSubmit);

  renderizarListaRutinas();
}

function llenarDropdownSociosRutina() {
  const select = document.getElementById("rutina-socio-id");
  if (!select) return;

  if (socios.length === 0) {
    select.innerHTML = `<option value="">-- No hay socios registrados --</option>`;
    return;
  }
  select.innerHTML = socios.map(s => `<option value="${s.id}">${s.nombre} (ID: #${s.id})</option>`).join('');
}

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

function handleRutinaSubmit(event) {
  event.preventDefault();
  const form = event.target;

  const errEjercicios = document.getElementById("err-rutina-ejercicios");
  const checkboxes = document.querySelectorAll("input[name='rutina-ejercicio']:checked");

  const formValido = validarFormulario(form);
  if (checkboxes.length === 0) {
    if (errEjercicios) errEjercicios.textContent = "Selecciona al menos un ejercicio del catálogo.";
  } else if (errEjercicios) {
    errEjercicios.textContent = "";
  }

  if (!formValido || checkboxes.length === 0) {
    mostrarToast("Revisa los campos y selecciona al menos un ejercicio.", "warning");
    return;
  }

  const socioId = parseInt(document.getElementById("rutina-socio-id").value);
  const grupo = document.getElementById("rutina-grupo").value.trim();
  const fecha = document.getElementById("rutina-fecha").value;
  const listaEjercicios = Array.from(checkboxes).map(cb => cb.value).join(", ");

  const nuevoId = rutinasAsignadas.length > 0 ? Math.max(...rutinasAsignadas.map(r => r.id)) + 1 : 1;
  const nuevaRutina = { id: nuevoId, socioId, grupo, ejercicios: listaEjercicios, fechaAsignada: fecha };

  rutinasAsignadas = rutinasAsignadas.filter(r => !(r.socioId === socioId && r.grupo.toLowerCase() === grupo.toLowerCase()));
  rutinasAsignadas.push(nuevaRutina);

  actualizarSQLConsola("INSERT_RUTINA", nuevaRutina);
  guardarBD();
  mostrarToast("Rutina de entrenamiento asignada y guardada con éxito.", "success");

  limpiarAutosave(AUTOSAVE_KEY_RUTINA);
  form.reset();
  document.querySelectorAll("input[name='rutina-ejercicio']:checked").forEach(cb => cb.checked = false);
  document.getElementById("rutina-fecha").value = fechaHoyISO();
  llenarDropdownSociosRutina();

  renderizarListaRutinas();
}

async function deleteRutina(id) {
  const confirmado = await confirmarAccion("¿Deseas desvincular o eliminar esta rutina de entrenamiento?");
  if (!confirmado) return;

  rutinasAsignadas = rutinasAsignadas.filter(r => r.id !== id);
  guardarBD();
  renderizarListaRutinas();
  mostrarToast("Rutina eliminada.", "success");
}

function renderizarListaRutinas() {
  const rutinasContainer = document.getElementById("rutinas-list-container");
  if (!rutinasContainer) return;

  if (rutinasAsignadas.length === 0) {
    rutinasContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding: 2rem;">No hay planes de entrenamiento activos. Asigna uno a la izquierda.</p>`;
    return;
  }

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
