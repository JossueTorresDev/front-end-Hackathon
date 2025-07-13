import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ISale } from '../../../core/interfaces/sale';
import { SaleService } from '../../../core/services/sale.service';
import { CustomerService } from '../../../core/services/customer.service';
import { ProductService } from '../../../core/services/product.service';
import { Customer } from '../../../core/interfaces/customer';
import { Product } from '../../../core/interfaces/product';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './modal-sale.component.html',
  styleUrls: ['./modal-sale.component.css'],
})
export class ModalSaleComponent implements OnInit {
  saleForm!: FormGroup;
  customers: Customer[] = [];
  products: Product[] = [];
  isLoading = false;
  isEditing = false;
  modalTitle = 'Nueva Venta';

  today: Date = new Date();
  minDate: Date = new Date(new Date().setDate(new Date().getDate() - 7));

  paymentMethods = [
    { value: 'EFECTIVO', viewValue: 'Efectivo' },
    { value: 'TARJETA', viewValue: 'Tarjeta' },
    { value: 'TRANSFERENCIA', viewValue: 'Transferencia Bancaria' }
  ];

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private customerService: CustomerService,
    private productService: ProductService,
    public dialogRef: MatDialogRef<ModalSaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ISale | null
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadCustomers();
    
    this.loadProducts().then(() => {
      if (!this.data) {
        this.addDetail();
      }
    });

    if (this.data) {
      this.isEditing = true;
      this.modalTitle = 'Editar Venta';
      this.populateForm();
    }
  }

  initForm(): void {
    this.saleForm = this.fb.group({
      id: [null],
      dateSale: [new Date(), [Validators.required, this.dateWithinLast7DaysValidator]],
      customerId: [null, Validators.required],
      sellerId: [1],
      paymentMethod: ['EFECTIVO', Validators.required],
      status: ['A'],
      saleDetails: this.fb.array([])
    });
  }

  populateForm(): void {
    if (!this.data) return;
    
    this.saleForm.patchValue({
      id: this.data.id,
      dateSale: new Date(this.data.dateSale),
      customerId: this.data.customerId,
      sellerId: this.data.sellerId,
      paymentMethod: this.data.paymentMethod,
      status: this.data.status
    });

    this.detailsFormArray.clear();

    if (this.data.saleDetails && this.data.saleDetails.length > 0) {
      this.data.saleDetails.forEach(detail => {
        this.detailsFormArray.push(this.createDetailForm(
          detail.id,
          detail.productId,
          detail.amount,
          detail.saleCost
        ));
      });
    } else {
      this.addDetail();
    }
  }

  loadCustomers(): void {
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.customers = data.filter(customer => customer.status === 'A');
      },
      error: (err) => {
        console.error('Error loading customers', err);
        Swal.fire('Error', 'No se pudieron cargar los clientes', 'error');
      }
    });
  }

  loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.productService.getAllProducts().subscribe({
        next: (data) => {
          this.products = data.filter(product => product.status === 'A');
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar productos', err);
          Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
          reject(err);
        }
      });
    });
  }

  get detailsFormArray(): FormArray {
    return this.saleForm.get('saleDetails') as FormArray;
  }

  createDetailForm(id: number | null = null, productId: number | null = null, amount: number = 1, saleCost: number = 0): FormGroup {
    return this.fb.group({
      id: [id],
      productId: [productId, Validators.required],
      amount: [amount, [Validators.required, Validators.min(1)]],
      saleCost: [saleCost, [Validators.required, Validators.min(0)]],
      sale: ['']
    });
  }

  addDetail(): void {
    const selectedProductIds = this.detailsFormArray.controls
      .map(ctrl => ctrl.get('productId')?.value)
      .filter(id => id !== null);

    const availableProducts = this.products.filter(p => !selectedProductIds.includes(p.id));

    if (availableProducts.length === 0) {
      Swal.fire('Información', 'Ya agregaste todos los productos disponibles', 'info');
      return;
    }

    const detailGroup = this.fb.group({
      productId: [null, Validators.required],
      amount: [1, [Validators.required, Validators.min(1)]],
      saleCost: [0, [Validators.required, Validators.min(0)]]
    });

    detailGroup.get('productId')?.valueChanges.subscribe(productId => {
      const selectedProduct = this.products.find(p => p.id === productId);

      const isDuplicate = this.detailsFormArray.controls.some(ctrl =>
        ctrl !== detailGroup && ctrl.get('productId')?.value === productId
      );

      if (isDuplicate) {
        Swal.fire('Duplicado', 'Este producto ya ha sido agregado.', 'warning');
        detailGroup.get('productId')?.setValue(null);
        detailGroup.get('saleCost')?.setValue(0);
      } else if (selectedProduct) {
        detailGroup.get('saleCost')?.setValue(selectedProduct.price);
      }
    });

    this.detailsFormArray.push(detailGroup);
  }

  removeDetail(index: number): void {
    if (this.detailsFormArray.length > 1) {
      this.detailsFormArray.removeAt(index);
    } else {
      Swal.fire('Información', 'Debe haber al menos un detalle en la venta', 'info');
    }
  }

  calculateTotal(): number {
    let total = 0;
    for (let i = 0; i < this.detailsFormArray.length; i++) {
      const detail = this.detailsFormArray.at(i).value;
      total += (detail.amount * detail.saleCost);
    }
    return total;
  }

  formatDateForBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onSubmit(): void {
  if (this.saleForm.invalid) {
    Swal.fire('Error', 'Por favor complete todos los campos requeridos', 'error');
    return;
  }

  // 🚨 Validar stock antes de enviar al backend
  const detalles = this.detailsFormArray.value;
  for (const detalle of detalles) {
    const producto = this.products.find(p => p.id === detalle.productId);
    if (!producto) continue;

    if (detalle.amount > producto.stock) {
      Swal.fire({
        title: '¡Stock insuficiente!',
        text: `El producto "${producto.name}" solo tiene ${producto.stock} unidades disponibles.`,
        icon: 'warning',
        confirmButtonText: 'Entendido'
      });
      return; // ❌ Detener el proceso si no hay stock suficiente
    }
  }

  // ✅ Continuar si hay stock
  this.isLoading = true;
  const saleData: ISale = { ...this.saleForm.value };

  if (saleData.dateSale) {
    saleData.dateSale = this.formatDateForBackend(new Date(saleData.dateSale));
  }

  if (this.isEditing) {
    this.saleService.updateSale(saleData.id, saleData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('¡Éxito!', 'Venta actualizada correctamente', 'success');
        this.dialogRef.close('refresh');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating sale', err);
        Swal.fire('Error', 'No se pudo actualizar la venta', 'error');
      }
    });
  } else {
    this.saleService.createSale(saleData).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('¡Éxito!', 'Venta creada correctamente', 'success');
        this.dialogRef.close('refresh');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error creating sale', err);
        Swal.fire('Error', 'No se pudo crear la venta', 'error');
      }
    });
  }
}
  cancel(): void {
    this.dialogRef.close();
  }

  dateWithinLast7DaysValidator(control: any): { [key: string]: boolean } | null {
    const selectedDate = new Date(control.value);
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    selectedDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    if (selectedDate > today) return { futureDate: true };
    if (selectedDate < sevenDaysAgo) return { tooOld: true };

    return null;
  }
}
