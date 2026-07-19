/**
 * ==========================================================================
 * LÓGICA DE LA LANDING PAGE (PÚBLICA) — index.html
 * ==========================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("landing-contact-form");
  if (!form) return;

  activarLimpiezaDeErroresEnVivo(form);

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validarFormulario(form)) {
      mostrarToast("Revisa los campos marcados antes de enviar tu mensaje.", "warning");
      return;
    }

    const nombre = document.getElementById("c-name").value.trim();

    mostrarToast(
      `¡Gracias, ${nombre}! Tu mensaje se simuló de forma exitosa. En un entorno real, esto se registraría en la base de datos.`,
      "success"
    );
    form.reset();
  });
});
