import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  title = 'LaEsquinita';
  isCollapsed = false;
  currentRoute: string = 'Dashboard';
  isLoginRoute: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService // ✅ inyecta AuthService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentRoute();
      this.isLoginRoute = this.router.url === '/login';
    });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  getCurrentRouteName(): string {
    return this.currentRoute;
  }

  private updateCurrentRoute() {
    const currentUrl = this.router.url.split('/')[1] || 'dashboard';
    const routeMap: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'vendedor': 'Vendedor',
      'cliente': 'Cliente',
      'proveedor': 'Proveedor',
      'venta': 'Venta',
      'compra': 'Compra'
    };
    this.currentRoute = routeMap[currentUrl] || 'Dashboard';
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    if (window.innerWidth < 768) {
      this.isCollapsed = true;
    } else if (window.innerWidth > 1200) {
      this.isCollapsed = false;
    }
  }

  ngOnInit() {
    if (window.innerWidth < 768) {
      this.isCollapsed = true;
    }

    this.isLoginRoute = this.router.url === '/login';
    this.updateCurrentRoute();
  }

  logout(): void {
  this.authService.logout();             // ✅ limpia el token
  this.router.navigate(['/login']);      // ✅ redirige al login
}

}
