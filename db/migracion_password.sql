-- =============================================================
-- MIGRACIÓN: AGREGAR PASSWORD_HASH — Iron Habit Gym
-- Evidencia GA7-220501096-AA5-EV01
-- =============================================================

-- Columna para el hash de contraseña (NULL permitido: usuarios creados solo con Google)
ALTER TABLE usuarios ADD COLUMN password_hash VARCHAR(255) NULL AFTER email;
