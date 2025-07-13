import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentRoute();
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
      'students': 'Estudiantes'
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
    this.updateCurrentRoute();
  }

  logout(): void {
    // Puedes eliminar completamente este método si no usas autenticación
    console.log('Logout (no hace nada porque no hay login)');
  }
}
