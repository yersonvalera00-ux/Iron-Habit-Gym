/**
 * ==========================================================================
 * PESTAÑA: PANEL DE CONTROL (KPIS) — sections/kpis.html
 * initTabKpis() se ejecuta cada vez que dashboard.js inserta este fragmento.
 * ==========================================================================
 */
function initTabKpis() {
  const totalSocios = socios.length;
  const activos = socios.filter(s => s.estado === "Activo").length;
  const vencidos = socios.filter(s => s.estado === "Vencido").length;
  const totalCaja = pagosCaja.reduce((acc, p) => acc + p.monto, 0);
  const porcentajeActivos = totalSocios > 0 ? Math.round((activos / totalSocios) * 100) : 0;

  document.getElementById("kpi-total-socios").innerText = totalSocios;
  document.getElementById("kpi-active-socios").innerText = activos;
  document.getElementById("kpi-expired-socios").innerText = vencidos;
  document.getElementById("kpi-monthly-income").innerText = formatearMoneda(totalCaja);

  const porcentajeEl = document.querySelector("#kpi-active-socios ~ .kpi-card-sub.up span");
  if (porcentajeEl) porcentajeEl.textContent = porcentajeActivos + "%";

  const kpiRecentTable = document.getElementById("kpi-recent-members-table");
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

  renderizarGraficaIngresos();
}

/** Genera la barra de ingresos SVG que también se usa en Estadísticas */
function renderizarGraficaIngresos() {
  const container = document.getElementById("chart-bars-income-container");
  if (!container) return;

  const ingresosMesActual = pagosCaja.reduce((acc, p) => acc + p.monto, 0);
  const ingresosMesAnterior = 420000;

  const alturaMax = 140;
  const ingresosMax = Math.max(ingresosMesActual, ingresosMesAnterior, 1000000);

  const alturaBarra1 = (ingresosMesAnterior / ingresosMax) * alturaMax;
  const alturaBarra2 = (ingresosMesActual / ingresosMax) * alturaMax;

  const yBarra1 = 170 - alturaBarra1;
  const yBarra2 = 170 - alturaBarra2;

  container.innerHTML = `
    <rect x="100" y="${yBarra1}" width="50" height="${alturaBarra1}" fill="#cbd5e1" rx="4">
      <title>Mes Anterior: $${ingresosMesAnterior.toLocaleString()}</title>
    </rect>
    <text x="125" y="${yBarra1 - 8}" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle">$${(ingresosMesAnterior/1000).toFixed(0)}k</text>

    <rect x="230" y="${yBarra2}" width="50" height="${alturaBarra2}" fill="var(--accent)" rx="4">
      <title>Mes Actual: $${ingresosMesActual.toLocaleString()}</title>
    </rect>
    <text x="255" y="${yBarra2 - 8}" font-size="10" font-weight="bold" fill="var(--accent)" text-anchor="middle">$${(ingresosMesActual/1000).toFixed(0)}k</text>
  `;
}
