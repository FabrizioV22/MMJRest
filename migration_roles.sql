-- 1. Crear la tabla de usuarios vinculada a la autenticación
CREATE TABLE public.usuarios (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    nombre_completo TEXT,
    rol TEXT DEFAULT 'PENDIENTE' CHECK (rol IN ('PENDIENTE', 'ADMIN', 'MESERO', 'ALMACEN')),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Habilitar seguridad de nivel de fila (Row Level Security) (Opcional pero recomendado)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 3. Crear una política para que cualquiera pueda leer los usuarios (necesario para el sistema interno)
CREATE POLICY "Lectura publica de usuarios" ON public.usuarios
    FOR SELECT USING (true);

-- 4. Crear una política para que solo administradores o sistema puedan actualizar
CREATE POLICY "Actualizacion de usuarios" ON public.usuarios
    FOR UPDATE USING (true); -- (Simplificado para este proyecto interno)

-- 5. Crear la función que se ejecutará al crear un usuario nuevo
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre_completo, rol)
  VALUES (new.id, new.email, 'PENDIENTE');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Crear el Trigger que escucha cuando creas un usuario en Auth
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
