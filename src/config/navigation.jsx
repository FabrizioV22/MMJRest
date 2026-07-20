import { LayoutDashboard, Package, Wallet, Users } from 'lucide-react'
import { DashboardModule } from '../features/Dashboard/DashboardModule'
import { CatalogModule } from '../features/Catalog/CatalogModule'
import { UsersModule } from '../features/Users/UsersModule'

// Componente placeholder para módulos en construcción
const CajaModuleMock = () => <div className="p-8 text-center text-slate-500">Módulo Caja (En construcción)</div>

export const APP_ROUTES = [
  { 
    path: '/', 
    name: 'Inicio', 
    icon: LayoutDashboard, 
    component: DashboardModule, 
    allowedRoles: ['ADMIN'] 
  },
  { 
    path: '/inventario', 
    name: 'Inventario', 
    icon: Package, 
    component: CatalogModule, 
    allowedRoles: ['ADMIN', 'ALMACEN'] 
  },
  { 
    path: '/caja', 
    name: 'Caja', 
    icon: Wallet, 
    component: CajaModuleMock, 
    allowedRoles: ['ADMIN', 'MESERO'] 
  },
  { 
    path: '/personal', 
    name: 'Personal', 
    icon: Users, 
    component: UsersModule, 
    allowedRoles: ['ADMIN'] 
  },
]
