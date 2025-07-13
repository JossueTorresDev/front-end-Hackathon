import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatButtonModule } from '@angular/material/button'; // 👉 importa el módulo del botón

@Component({
  standalone: true,
  selector: 'app-access-denied',
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.css'],
  imports: [MatButtonModule] // 👉 importa aquí también
})
export class AccessDeniedComponent {
  constructor(private location: Location) {}

  volver() {
    this.location.back();
  }
}
