import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ClienteComponent } from './feature/cliente/cliente.component';
import { CompraComponent } from './feature/compra/compra.component';
import { VendedorComponent } from './feature/vendedor/vendedor.component';
import { ProductoComponent } from './feature/producto/producto.component';
import { VentaComponent } from './feature/venta/venta.component';
import { DashboardComponent } from './feature/dashboard/dashboard.component';
import { LoginComponent } from './feature/login/login.component';

import { AuthGuard } from './core/guards/auth.guard';
import { AccessDeniedComponent } from './shared/access-denied/access-denied.component'; // 👈 importa el componente

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ✅ Ruta pública
  { path: 'login', component: LoginComponent },

  // ✅ Ruta para cuando no tiene permisos
  { path: 'access-denied', component: AccessDeniedComponent },

  // ✅ Rutas protegidas por autenticación
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'cliente', component: ClienteComponent, canActivate: [AuthGuard] },
  { path: 'compra', component: CompraComponent, canActivate: [AuthGuard] },
  { path: 'vendedor', component: VendedorComponent, canActivate: [AuthGuard] },
  { path: 'producto', component: ProductoComponent, canActivate: [AuthGuard] },
  { path: 'venta', component: VentaComponent, canActivate: [AuthGuard] },

  // ✅ Ruta comodín para rutas no definidas
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
