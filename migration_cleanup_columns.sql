-- Eliminar la columna 'activo' de las tablas areas y categorias
-- ya que ahora cuentan con eliminación permanente (hard delete) 
-- y no necesitan la funcionalidad de archivado (soft delete).

ALTER TABLE public.areas DROP COLUMN IF EXISTS activo;
ALTER TABLE public.categorias DROP COLUMN IF EXISTS activo;
