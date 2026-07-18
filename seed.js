import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

// Cargar .env de la raíz del proyecto
const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: resolve(__dirname, '.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
  console.error("❌ Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con valores reales en tu archivo .env")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
  console.log('🌱 Inicializando carga de datos (Seeding)...')
  
  const categories = [
    { nombre: 'COCINA' },
    { nombre: 'SALÓN' },
    { nombre: 'ALMACÉN' },
    { nombre: 'DESCARTABLES' }
  ]

  console.log('1. Verificando categorías...')
  for (const cat of categories) {
    const { error } = await supabase.from('categorias').insert([cat])
    if (error) {
      if (error.code === '23505') {
        console.log(`- Categoría ${cat.nombre} ya existe. (Ignorando)`)
      } else {
        console.error(`- Error insertando categoría ${cat.nombre}:`, error.message)
      }
    } else {
      console.log(`- Categoría ${cat.nombre} insertada exitosamente.`)
    }
  }

  // Obtener IDs de las categorías recién creadas o existentes
  const { data: dbCategories, error: catError } = await supabase.from('categorias').select('*')
  if (catError || !dbCategories || dbCategories.length === 0) {
    console.error('❌ No se pudieron obtener las categorías de la base de datos:', catError?.message)
    return
  }

  const getCatId = (name) => dbCategories.find(c => c.nombre === name)?.id

  const products = [
    { category_id: getCatId('COCINA'), nombre: 'Huachalomo', unidad_medida: 'gr', stock_actual: 20 },
    { category_id: getCatId('DESCARTABLES'), nombre: 'Deli 800', unidad_medida: 'unidad', stock_actual: 100 },
    { category_id: getCatId('SALÓN'), nombre: 'Plato Tendido', unidad_medida: 'unidad', stock_actual: 50 },
  ]

  console.log('\n2. Verificando productos de prueba...')
  // Primero borramos productos de prueba para no duplicar si corremos esto múltiples veces
  const { error: delError } = await supabase.from('productos').delete().in('nombre', products.map(p => p.nombre))
  if (delError) console.error('Error limpiando productos anteriores:', delError.message)

  for (const prod of products) {
    if (!prod.category_id) continue;
    const { error } = await supabase.from('productos').insert([prod])
    if (error) {
      console.error(`- Error insertando producto ${prod.nombre}:`, error.message)
    } else {
      console.log(`- Producto ${prod.nombre} insertado exitosamente.`)
    }
  }

  console.log('\n✅ Seed finalizado correctamente. Revisa tu aplicación.')
}

seed()
