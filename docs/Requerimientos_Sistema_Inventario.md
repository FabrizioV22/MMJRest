# Sistema de Control de Inventarios y Recaudación - Documento de Requerimientos (PRD)

> **Nota para Agentes de IA:** Este documento establece la arquitectura, requerimientos y modelo de datos para el desarrollo del sistema. Usar este documento como contexto base para la generación de código, estructura de base de datos y diseño de interfaces.

## 1. Visión General del Proyecto
Desarrollo de un sistema web para el control de inventarios (Kardex) y consolidación de recaudación de un restaurante. El objetivo principal es proporcionar una herramienta con una interfaz extremadamente amigable para los operadores (personal de cocina, almacén, salón), garantizando la exactitud en el flujo de mercadería.

## 2. Stack Tecnológico (Low-Cost / Serverless)
* **Frontend:** React.js (Vite o Next.js)
* **Estilado / UI:** Tailwind CSS (Enfoque Mobile-First y Responsivo para Desktop).
* **Backend & Base de Datos:** Supabase (PostgreSQL, Autenticación, RLS, API autogenerada).
* **Despliegue:** Vercel.
* **Arquitectura:** PWA (Progressive Web App) para facilitar su uso rápido en dispositivos móviles sin necesidad de instalar apps nativas.

## 3. Requerimientos Funcionales

### 3.1. Módulo de Catálogos (Productos y Categorías)
Capacidad de realizar CRUD (Crear, Leer, Actualizar, Borrar) sobre el catálogo de productos, respetando la siguiente jerarquía de categorías base:
* **COCINA:** Cárnicos, Verduras, Tubérculos.
* **SALÓN:** Menaje (platos), Cristales, Cubiertos.
* **ALMACÉN:** Abarrotes, Menestras, Condimentos.
* **DESCARTABLES:** Deli 800, Deli 1000, ½ Litro Blanco con tapa, 6 Oz Tapa Transparente, 4 Oz Tapa Transparente, Tenedores #6, Cucharas #6, Cuchillos #6, Ajiseros 1 Oz Transparente.

### 3.2. Módulo de Control de Inventarios (Kardex)
Debe gestionar el flujo de cada ítem cumpliendo estrictamente la regla transaccional:
`SALDO INICIAL + INGRESO - EGRESO = STOCK ACTUAL`

* **Ejemplo de Trazabilidad Requerida (Item: Huachalomo 100gr):**
  * **Lunes 13 Julio:** Saldo Inicial: 20
  * **Martes 14 Julio:** Ingreso: 10 (Saldo transitorio: 30) -> Egreso: 8 -> Stock Final: 22
  * **Miércoles 15 Julio:** Ingreso: 20 (Saldo transitorio: 42) -> Egreso: 22 -> Stock Final: 20

### 3.3. Módulo de Consolidación de Recaudación
* Registro y consolidación de los ingresos monetarios.
* Módulo diseñado para cuadre de caja (gestión y revisión de ingresos y egresos de efectivo).

### 3.4. UX / Interfaz Amigable
* **Responsividad:** 100% adaptable. Interfaz optimizada para su uso en pantallas táctiles de móviles (para el personal en movimiento).
* **Interacción:** Botones grandes (Touch-friendly), formularios simplificados y rápidos, y visualización de datos (como el Kardex) mediante tablas con scroll horizontal o diseño de tarjetas colapsables en móvil.

## 4. Modelo de Datos Propuesto (Supabase / PostgreSQL)

Para garantizar la integridad y el cálculo histórico del Kardex, se establece un modelo relacional. A continuación, un boceto del esquema SQL para inicializar en Supabase:

```sql
-- 1. Tabla de Categorías (Maneja Categorías y Subcategorías si se autoreferencia o se divide)
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(100) NOT NULL -- Ej: COCINA, CARNICOS
);

-- 2. Tabla de Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria_id UUID REFERENCES categorias(id),
  nombre VARCHAR(255) NOT NULL,
  unidad_medida VARCHAR(50) -- Ej: gr, unidad
);

-- 3. Tabla del Kardex (Movimientos)
CREATE TABLE movimientos_kardex (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID REFERENCES productos(id),
  fecha DATE DEFAULT CURRENT_DATE,
  tipo_movimiento VARCHAR(20) CHECK (tipo_movimiento IN ('INGRESO', 'EGRESO', 'SALDO_INICIAL')),
  cantidad NUMERIC(10,2) NOT NULL,
  -- Recomendación: Llevar un registro del stock resultante por cada movimiento
  -- para facilitar consultas históricas rápidas sin recalcular toda la base de datos.
  stock_resultante NUMERIC(10,2), 
  observaciones TEXT
);
```

## 5. Directrices de Desarrollo para Agentes de IA
1. **Frontend:** Iniciar estructurando el layout principal (`App.jsx` o similar) con un Sidebar o Bottom-Navigation responsivo (Tailwind).
2. **Backend:** Asegurar la implementación de las Row Level Security (RLS) policies en Supabase desde el inicio, permitiendo que solo usuarios autenticados realicen cambios.
3. **Lógica de Kardex (Transacciones):** Al procesar un movimiento (`INGRESO` o `EGRESO`), el Agente debe asegurar que se actualice el inventario general y se guarde el registro en `movimientos_kardex`. Se sugiere usar Funciones RPC en Supabase (PostgreSQL Functions) para manejar las inserciones y asegurar que no haya problemas de concurrencia al calcular el `stock_resultante`.
