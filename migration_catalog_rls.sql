-- Habilitar RLS en las tablas del inventario por seguridad
ALTER TABLE public.areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimientos_kardex ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir TODO (Lectura, Inserción, Actualización, Eliminación) 
-- a cualquier usuario que haya iniciado sesión (authenticated)

-- ÁREAS
DROP POLICY IF EXISTS "Permitir todo a usuarios logueados en areas" ON public.areas;
CREATE POLICY "Permitir todo a usuarios logueados en areas" ON public.areas
    FOR ALL TO authenticated USING (true);

-- CATEGORÍAS
DROP POLICY IF EXISTS "Permitir todo a usuarios logueados en categorias" ON public.categorias;
CREATE POLICY "Permitir todo a usuarios logueados en categorias" ON public.categorias
    FOR ALL TO authenticated USING (true);

-- PRODUCTOS
DROP POLICY IF EXISTS "Permitir todo a usuarios logueados en productos" ON public.productos;
CREATE POLICY "Permitir todo a usuarios logueados en productos" ON public.productos
    FOR ALL TO authenticated USING (true);

-- MOVIMIENTOS KARDEX
DROP POLICY IF EXISTS "Permitir todo a usuarios logueados en movimientos" ON public.movimientos_kardex;
CREATE POLICY "Permitir todo a usuarios logueados en movimientos" ON public.movimientos_kardex
    FOR ALL TO authenticated USING (true);
