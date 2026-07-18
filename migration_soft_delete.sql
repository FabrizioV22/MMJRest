-- Agregar columna 'activo' a las tablas principales para permitir Soft Delete (Archivado)
ALTER TABLE areas ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;
ALTER TABLE productos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Asegurar que los registros existentes estén activos
UPDATE areas SET activo = true WHERE activo IS NULL;
UPDATE categorias SET activo = true WHERE activo IS NULL;
UPDATE productos SET activo = true WHERE activo IS NULL;
