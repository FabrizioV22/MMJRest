-- Crear tabla de Áreas
CREATE TABLE IF NOT EXISTS areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS público para áreas (Temporal)
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir todo a anon en areas" ON areas FOR ALL TO anon USING (true);

-- Insertar las áreas principales del restaurante (si no existen)
INSERT INTO areas (nombre) VALUES 
('COCINA'), 
('SALÓN'), 
('ALMACÉN'), 
('DESCARTABLES')
ON CONFLICT (nombre) DO NOTHING;

-- Agregar la relación a la tabla categorías
ALTER TABLE categorias ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES areas(id) ON DELETE SET NULL;

-- Asignar todas las categorías existentes al área 'COCINA' por defecto (para que no queden huérfanas)
-- Obtener el ID de COCINA
DO $$ 
DECLARE
  cocina_id UUID;
BEGIN
  SELECT id INTO cocina_id FROM areas WHERE nombre = 'COCINA' LIMIT 1;
  UPDATE categorias SET area_id = cocina_id WHERE area_id IS NULL;
END $$;
