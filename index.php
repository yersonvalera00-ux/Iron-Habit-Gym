<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Iron Habit Gym — Sistema de Gestión Centro Deportivo</title>

  <link rel="icon" type="image/png" href="logo-icon-favicon.png">

  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary:  '#bf83fc',
            accent:   '#8406f9',
            'accent-hover': '#7003d6',
            dark:     '#1A0A2E',
            'text-main': '#0f172a',
          },
          fontFamily: {
            display: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
            body:    ['Inter', 'system-ui', 'sans-serif'],
          },
          borderRadius: {
            'xl2': '14px',
            'xl3': '24px',
          },
          boxShadow: {
            'card': '0 8px 16px rgba(29,40,58,0.06)',
            'card-lg': '0 16px 36px rgba(29,40,58,0.08)',
          },
        },
      },
    }
  </script>

  <!-- Fuentes (mismo que style.css) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- Estilos propios del proyecto (animaciones, badges, toast, etc.) -->
  <link rel="stylesheet" href="style.css">

  <style>
    /* Animación de entrada del menú móvil */
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    /* Hover de enlaces del menú móvil */
    .mobile-nav-link:hover {
      background-color: rgba(132, 6, 249, 0.05);
      color: #8406f9 !important;
    }
  </style>

  <!-- Tabler Icons -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/tabler-icons.min.css">
</head>
<body class="landing-body" id="app-body">

  <div id="layout-landing" class="page-layout active-layout">

    <!-- =====================================================================
         HEADER / NAVBAR
         ===================================================================== -->
    <header class="landing-header px-6 lg:px-12 py-3">

      <!-- Logo -->
      <a href="#" class="logo-brand" style="flex-shrink:0;">
        <div class="logo-brand-icon" style="padding:6px 10px 6px 16px;">
          <img src="logo-icon.png" alt="Logo Iron Habit" class="logo-img" style="width:40px;height:40px;">
        </div>
        <span class="logo-brand-text" style="white-space:nowrap; font-size:1.4rem;">Iron Habit Gym</span>
      </a>

      <!-- Nav escritorio (oculta hasta 1024px) -->
      <nav class="landing-nav hidden lg:flex">
        <a href="#inicio">Inicio</a>
        <a href="#servicios">Servicios</a>
        <a href="#planes">Planes</a>
        <a href="#horarios">Horarios</a>
        <a href="#contacto">Contacto</a>
        <a href="login.html" class="btn btn-primary">
          <i class="ti ti-lock"></i> Acceso Admin
        </a>
      </nav>

      <!-- Botón hamburguesa (visible hasta 1024px, cubre móvil + tablet) -->
      <button id="menu-toggle"
              class="lg:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg
                     border border-gray-200 bg-white/80 hover:bg-gray-50 transition-colors"
              aria-label="Abrir menú" aria-expanded="false">
        <span class="ham-bar block w-5 h-0.5 bg-gray-700 transition-all duration-300"></span>
        <span class="ham-bar block w-5 h-0.5 bg-gray-700 transition-all duration-300"></span>
        <span class="ham-bar block w-5 h-0.5 bg-gray-700 transition-all duration-300"></span>
      </button>
    </header>

    <!-- Menú móvil desplegable -->
    <div id="mobile-menu" style="display:none; position:fixed; top:65px; left:0; width:100%; z-index:9998;
         background:rgba(255,255,255,0.98); backdrop-filter:blur(12px); -webkit-backdrop-filter:blur(12px);
         border-bottom:1px solid #f1f5f9; box-shadow:0 8px 24px rgba(0,0,0,0.1);
         flex-direction:column; animation:slideDown 0.25s ease;">
      <a href="#inicio"    class="mobile-nav-link" style="display:block; padding:1rem 1.5rem; color:#475569; font-weight:500; border-bottom:1px solid #f1f5f9; text-decoration:none; transition:all 0.15s ease;">Inicio</a>
      <a href="#servicios" class="mobile-nav-link" style="display:block; padding:1rem 1.5rem; color:#475569; font-weight:500; border-bottom:1px solid #f1f5f9; text-decoration:none; transition:all 0.15s ease;">Servicios</a>
      <a href="#planes"    class="mobile-nav-link" style="display:block; padding:1rem 1.5rem; color:#475569; font-weight:500; border-bottom:1px solid #f1f5f9; text-decoration:none; transition:all 0.15s ease;">Planes</a>
      <a href="#horarios"  class="mobile-nav-link" style="display:block; padding:1rem 1.5rem; color:#475569; font-weight:500; border-bottom:1px solid #f1f5f9; text-decoration:none; transition:all 0.15s ease;">Horarios</a>
      <a href="#contacto"  class="mobile-nav-link" style="display:block; padding:1rem 1.5rem; color:#475569; font-weight:500; border-bottom:1px solid #f1f5f9; text-decoration:none; transition:all 0.15s ease;">Contacto</a>
      <div style="padding:1rem 1.5rem;">
        <a href="login.html" class="btn btn-primary" style="width:100%; justify-content:center;">
          <i class="ti ti-lock"></i> Acceso Admin
        </a>
      </div>
    </div>

    <!-- =====================================================================
         HERO
         ===================================================================== -->
    <section id="inicio" class="hero-section">
      <div class="hero-grid w-full">

        <!-- Texto -->
        <div class="hero-content">
          <h1>Toma el control de tu <span>entrenamiento</span> y salud</h1>
          <p>Gestiona tu progreso físico, asigna rutinas personalizadas y controla tus mensualidades en un solo lugar. Diseñado especialmente para optimizar centros deportivos.</p>
          <div class="hero-actions flex-wrap">
            <a href="#planes"   class="btn btn-primary">Ver Planes</a>
            <a href="#contacto" class="btn btn-outline">Saber Más</a>
          </div>
        </div>

        <!-- Tarjeta visual -->
        <div class="hero-visual mt-8 lg:mt-0">
          <div class="gym-card-visual">
            <i class="ti ti-barbell" style="font-size:4rem;margin-bottom:1rem;"></i>
            <h2 style="color:white;font-size:1.5rem;">Iron Habit Pass</h2>
            <p style="opacity:.6;font-size:.8rem;margin-top:5px;">Membresía Activa · Acceso Total</p>
          </div>
          <div class="visual-badge badge-1">
            <i class="ti ti-users" style="color:var(--primary);"></i>
            <div>
              <p style="font-size:.75rem;font-weight:bold;margin:0;">+100 Socios</p>
              <p style="font-size:.6rem;opacity:.7;margin:0;">Entrenando Hoy</p>
            </div>
          </div>
          <div class="visual-badge badge-2">
            <i class="ti ti-trending-up" style="color:var(--success);"></i>
            <div>
              <p style="font-size:.75rem;font-weight:bold;margin:0;">Progreso IMC</p>
              <p style="font-size:.6rem;opacity:.7;margin:0;">Monitoreado</p>
            </div>
          </div>
        </div>

      </div>
    </section>

    <!-- =====================================================================
         SERVICIOS
         ===================================================================== -->
    <section id="servicios" class="section-padding bg-slate-100">
      <div class="section-container px-4 sm:px-6">

        <div class="section-header">
          <h2>Nuestros Servicios</h2>
          <p>Ofrecemos áreas especializadas para potenciar tu rendimiento físico al máximo.</p>
        </div>

        <!-- Grid: 1 col móvil · 2 cols tablet · 4 cols desktop -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8">

          <div class="service-card">
            <span class="service-icon">🏋️‍♂️</span>
            <h3>Musculación y Fuerza</h3>
            <p>Zonas de peso libre, máquinas selectoras avanzadas e instructores calificados para guiar tu entrenamiento.</p>
          </div>

          <div class="service-card">
            <span class="service-icon">🏃‍♂️</span>
            <h3>Cardio y Resistencia</h3>
            <p>Cintas de correr, elípticas, bicicletas estáticas y remos para mejorar tu salud cardiovascular.</p>
          </div>

          <div class="service-card">
            <span class="service-icon">🧘‍♀️</span>
            <h3>Clases Grupales</h3>
            <p>Spinning, Yoga, Pilates, Zumba y entrenamiento funcional guiado en diferentes horarios.</p>
          </div>

          <div class="service-card">
            <span class="service-icon">🍎</span>
            <h3>Asesoría Nutricional</h3>
            <p>Planes de alimentación personalizados según tus objetivos: pérdida de grasa, ganancia muscular o salud.</p>
          </div>

        </div>
      </div>
    </section>

    <!-- =====================================================================
         PLANES DE MEMBRESÍA
         ===================================================================== -->
    <section id="planes" class="section-padding">
      <div class="section-container px-4 sm:px-6">

        <div class="section-header">
          <h2>Planes de Membresía</h2>
          <p>Elige la opción que mejor se adapte a tus necesidades y comienza hoy mismo.</p>
        </div>

        <!-- Grid: 1 col móvil · 3 cols desktop -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

          <!-- Plan Mensual -->
          <div class="pricing-card">
            <h3>Plan Mensual General</h3>
            <div class="pricing-price">$90,000 <span>/ mes</span></div>
            <ul class="pricing-features">
              <li>Acceso ilimitado a zona de pesas</li>
              <li>Locker básico diario</li>
              <li>1 clase grupal por semana</li>
              <li>Entrenamiento libre de Lunes a Sábado</li>
            </ul>
            <a href="login.html" class="btn btn-outline mt-auto w-full text-center">Comenzar Plan</a>
          </div>

          <!-- Plan Trimestral (Popular) -->
          <div class="pricing-card popular">
            <div class="popular-badge">Recomendado</div>
            <h3>Plan Trimestral</h3>
            <div class="pricing-price">$240,000 <span>/ 3 meses</span></div>
            <ul class="pricing-features">
              <li>Acceso ilimitado a zona de pesas y cardio</li>
              <li>Locker básico diario</li>
              <li>3 clases grupales por semana</li>
              <li>Evaluación física y de IMC mensual</li>
              <li>Ahorro del 11% comparado al mensual</li>
            </ul>
            <a href="login.html" class="btn btn-primary mt-auto w-full text-center">Comenzar Plan</a>
          </div>

          <!-- Plan Anual VIP -->
          <div class="pricing-card">
            <h3>Plan Anual VIP</h3>
            <div class="pricing-price">$864,000 <span>/ año</span></div>
            <ul class="pricing-features">
              <li>Acceso ilimitado 24/7 al centro deportivo</li>
              <li>Locker VIP exclusivo permanente</li>
              <li>Clases grupales e interactivas ilimitadas</li>
              <li>Entrenador personal 2 veces por semana</li>
              <li>Seguimiento de nutrición mensual</li>
              <li>Ahorro del 20% en tarifa anual</li>
            </ul>
            <a href="login.html" class="btn btn-outline mt-auto w-full text-center">Comenzar Plan</a>
          </div>

        </div>
      </div>
    </section>

    <!-- =====================================================================
         HORARIOS
         ===================================================================== -->
    <section id="horarios" class="section-padding bg-slate-100">
      <div class="section-container px-4 sm:px-6">

        <div class="section-header">
          <h2>Horarios de Apertura</h2>
          <p>Organiza tu semana y entrena en el horario que más te convenga.</p>
        </div>

        <div class="hours-box">
          <!-- Grid: 1 col móvil · 2 cols tablet+ -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-8">

            <div>
              <h3 class="mb-6" style="color:var(--accent);">
                <i class="ti ti-clock"></i> Semana
              </h3>
              <div class="hour-item"><span>Lunes a Viernes</span><span>5:00 AM - 10:00 PM</span></div>
              <div class="hour-item mt-4"><span>Sábados</span><span>6:00 AM - 6:00 PM</span></div>
            </div>

            <div>
              <h3 class="mb-6" style="color:var(--accent);">
                <i class="ti ti-calendar"></i> Fines de Semana
              </h3>
              <div class="hour-item"><span>Domingos</span><span>8:00 AM - 2:00 PM</span></div>
              <div class="hour-item mt-4"><span>Festivos</span><span>Cerrado</span></div>
            </div>

          </div>
        </div>
      </div>
    </section>

    <!-- =====================================================================
         CONTACTO
         ===================================================================== -->
    <section id="contacto" class="section-padding">
      <div class="section-container px-4 sm:px-6">

        <div class="section-header">
          <h2>Contáctanos</h2>
          <p>¿Tienes dudas o deseas reservar una visita guiada? Escríbenos.</p>
        </div>

        <!-- Grid: 1 col móvil · 2 cols desktop -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 max-w-4xl mx-auto">

          <!-- Info -->
          <div class="contact-info">
            <h3>Información de Contacto</h3>
            <p class="text-slate-500 mb-8">Nuestro equipo administrativo está disponible para atender cualquier inquietud referente a membresías, convenios corporativos o entrenamiento personalizado.</p>

            <div class="contact-item">
              <div class="contact-icon"><i class="ti ti-map-pin"></i></div>
              <div class="contact-text">
                <h4>Dirección</h4>
                <p>Suroriente, Barranquilla, Colombia</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon"><i class="ti ti-phone"></i></div>
              <div class="contact-text">
                <h4>Teléfono</h4>
                <p>+57 300 000 0000</p>
              </div>
            </div>
            <div class="contact-item">
              <div class="contact-icon"><i class="ti ti-mail"></i></div>
              <div class="contact-text">
                <h4>Correo</h4>
                <p>contacto@ironhabitgym.com</p>
              </div>
            </div>
          </div>

          <!-- Formulario -->
          <div class="contact-form-card">
            <form id="landing-contact-form" novalidate>
              <div class="form-group">
                <label for="c-name">Nombre Completo</label>
                <input type="text" id="c-name" name="c-name" class="form-control" placeholder="Ej. Juan Pérez" required>
                <small class="field-error-msg" id="err-c-name"></small>
              </div>
              <div class="form-group">
                <label for="c-email">Correo Electrónico</label>
                <input type="email" id="c-email" name="c-email" class="form-control" placeholder="Ej. juan@correo.com" required>
                <small class="field-error-msg" id="err-c-email"></small>
              </div>
              <div class="form-group">
                <label for="c-message">Mensaje</label>
                <textarea id="c-message" name="c-message" class="form-control" placeholder="Escribe tu mensaje aquí..." required></textarea>
                <small class="field-error-msg" id="err-c-message"></small>
              </div>
              <button type="submit" class="btn btn-primary w-full" id="btn-submit-contact">
                Enviar Mensaje
              </button>
            </form>
          </div>

        </div>
      </div>
    </section>

    <!-- =====================================================================
         FOOTER
         ===================================================================== -->
    <footer class="landing-footer">
      <div class="footer-content flex-col sm:flex-row gap-6 sm:gap-0">
        <div class="footer-logo">
          <div class="footer-logo-icon"><i class="ti ti-barbell"></i></div>
          <span class="footer-logo-text">Iron Habit Gym</span>
        </div>
        <div class="footer-links flex-wrap justify-center sm:justify-end gap-4 sm:gap-8">
          <a href="#inicio">Inicio</a>
          <a href="#servicios">Servicios</a>
          <a href="#planes">Planes</a>
          <a href="#horarios">Horarios</a>
        </div>
      </div>
      <p class="footer-copy">Iron Habit Gym · SENA Barranquilla · Análisis y Desarrollo de Software · Ficha 3186630</p>
    </footer>

  </div><!-- /layout-landing -->

  <!-- Toast -->
  <div id="toast-container" class="toast-container" aria-live="polite"></div>

  <!-- =========================================================================
       SCRIPTS
       ========================================================================= -->
  <script src="js/common.js"></script>
  <script src="js/landing.js"></script>

  <!-- Menú hamburguesa (inline para no depender de landing.js) -->
  <script>
    (function () {
      const toggle = document.getElementById('menu-toggle');
      const menu   = document.getElementById('mobile-menu');
      const bars   = toggle.querySelectorAll('.ham-bar');

      function openMenu() {
        menu.style.display = 'flex';
        toggle.setAttribute('aria-expanded', 'true');
        bars[0].style.transform = 'translateY(8px) rotate(45deg)';
        bars[1].style.opacity   = '0';
        bars[2].style.transform = 'translateY(-8px) rotate(-45deg)';
      }

      function closeMenu() {
        menu.style.display = 'none';
        toggle.setAttribute('aria-expanded', 'false');
        bars[0].style.transform = '';
        bars[1].style.opacity   = '1';
        bars[2].style.transform = '';
      }

      toggle.addEventListener('click', function () {
        const isOpen = menu.style.display === 'flex';
        isOpen ? closeMenu() : openMenu();
      });

      // Cerrar menú al hacer click en un enlace
      menu.querySelectorAll('.mobile-nav-link').forEach(function (link) {
        link.addEventListener('click', closeMenu);
      });
    })();
  </script>

</body>
</html>
