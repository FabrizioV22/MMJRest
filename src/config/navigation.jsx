import { LayoutDashboard, Package, Wallet, Users, LineChart } from 'lucide-react'
import { DashboardModule } from '../features/Dashboard/DashboardModule'
import { FinanzasDashboardModule } from '../features/Finanzas/Dashboard/FinanzasDashboardModule'
import { CatalogModule } from '../features/Catalog/CatalogModule'
import { UsersModule } from '../features/Users/UsersModule'
import { CajaModule } from '../features/Caja/CajaModule'

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
    path: '/finanzas',
    name: 'Finanzas',
    icon: LineChart,
    component: FinanzasDashboardModule,
    allowedRoles: ['ADMIN']
  },
  { 
    path: '/caja', 
    name: 'Caja', 
    icon: Wallet, 
    component: CajaModule, 
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
