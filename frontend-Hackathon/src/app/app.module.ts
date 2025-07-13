import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './feature/login/login.component';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';


// Angular Material Modules
import { LOCALE_ID } from '@angular/core';
import localeEsPE from '@angular/common/locales/es-PE';
import { registerLocaleData } from '@angular/common';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatOptionModule } from '@angular/material/core';

// Formularios y HTTP
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

// Componentes NO standalone
import { VendedorComponent } from './feature/vendedor/vendedor.component';
import { ClienteComponent } from './feature/cliente/cliente.component';
import { ProductoComponent } from './feature/producto/producto.component';
import { DashboardComponent } from './feature/dashboard/dashboard.component';
import { ModalClientComponent } from './feature/cliente/modal-client/modal-client.component';
import { ModalProductComponent } from './feature/producto/modal-product/modal-product.component';

// Componentes standalone (solo en imports)
import { CompraComponent } from './feature/compra/compra.component';
import { ModalPurchaseComponent } from './feature/compra/modal-purchase/modal-purchase.component';
import { PurchaseDetailComponent } from './feature/compra/purchase-detail/purchase-detail.component';
import { VentaComponent } from './feature/venta/venta.component';
import { ModalSaleComponent } from './feature/venta/modal-sale/modal-sale.component';
import { AccessDeniedComponent } from './shared/access-denied/access-denied.component';

registerLocaleData(localeEsPE);


  @NgModule({
  declarations: [
    AppComponent,
    VendedorComponent,
    ClienteComponent,
    ProductoComponent,
    DashboardComponent,
    ModalClientComponent,
    ModalProductComponent,
  ],

  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,

    // ✅ Componentes standalone (NO van en declarations)
    CompraComponent,
    AccessDeniedComponent,
    ModalPurchaseComponent,
    PurchaseDetailComponent,
    VentaComponent,
    ModalSaleComponent,

    // Angular Material
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatListModule,
    MatBadgeModule,
    MatTableModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatButtonToggleModule,
    MatOptionModule
  ],
  providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  { provide: LOCALE_ID, useValue: 'es-PE' }
],

  bootstrap: [AppComponent]
})
export class AppModule { }
