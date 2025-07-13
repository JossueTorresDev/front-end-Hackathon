import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { ISale } from '../../../core/interfaces/sale';
import { CustomerService } from '../../../core/services/customer.service';
import { Customer } from '../../../core/interfaces/customer';

@Component({
  selector: 'app-sale-detail',
  templateUrl: './sale-detail.component.html',
  styleUrls: ['./sale-detail.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatTableModule
  ]
})

export class SaleDetailComponent implements OnInit {
  // Columnas para la tabla de detalles
  displayedColumns: string[] = ['id', 'productId', 'amount', 'saleCost', 'subtotal'];

  customer: Customer | undefined;

  constructor(
    @Inject(MAT_DIALOG_DATA) public sale: ISale,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    // Convertir el customerId a número antes de pasarlo al servicio
    const customerId = +this.sale.customerId; // Conversión a número
    this.loadCustomerDetails(customerId);
  }

  loadCustomerDetails(customerId: number): void {
    this.customerService.getCustomerById(customerId).subscribe(
      (customer) => {
        this.customer = customer;
      },
      (error) => {
        console.error('Error al cargar los detalles del cliente', error);
      }
    );
  }

  // Calcular el subtotal de un detalle de venta
  calculateSubtotal(amount: number, cost: number): number {
    return amount * cost;
  }

  // Calcular el monto total de la venta
  calculateTotalAmount(): number {
    return this.sale.saleDetails.reduce((total, detail) => total + (detail.amount * detail.saleCost), 0);
  }
}