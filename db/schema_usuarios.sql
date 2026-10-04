-- =============================================================
-- TABLA DE USUARIOS DEL SISTEMA — Iron Habit Gym
-- Almacena administradores y usuarios autenticados (incluye Google OAuth)
-- =============================================================

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) NULL UNIQUE,
    nombre VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    avatar VARCHAR(500) NULL,
    rol VARCHAR(50) NOT NULL DEFAULT 'Administrador',
    estado VARCHAR(20) NOT NULL DEFAULT 'Activo',
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
