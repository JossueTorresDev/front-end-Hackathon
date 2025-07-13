import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { IPurchase } from '../../../core/interfaces/purchase'; // ✅ Usa IPurchase

@Component({
  selector: 'app-purchase-detail',
  templateUrl: './purchase-detail.component.html',
  styleUrls: ['./purchase-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule
  ]
})

export class PurchaseDetailComponent implements OnInit {
  // Columnas para la tabla de detalles
  displayedColumns: string[] = ['id', 'productId', 'productQuantity', 'purchasePrice', 'subtotal'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public purchase: IPurchase
  ) {}

  ngOnInit(): void {
    // No se necesita cargar datos externos, ya vienen en `purchase`
  }

  // Calcular el subtotal (aunque ya viene en el dato, por si acaso)
  calculateSubtotal(quantity: number, price: number): number {
    return quantity * price;
  }

  // Calcular el total general de la compra
  calculateTotalAmount(): number {
    return this.purchase.purchaseDetails.reduce(
      (total, detail) => total + (detail.productQuantity * detail.purchasePrice),
      0
    );
  }
}
