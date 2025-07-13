import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { IPurchase } from '../../../core/interfaces/purchase';
import { ProductService } from '../../../core/services/product.service';
import { PurchaseService } from '../../../core/services/purchase.service';
import { Product } from '../../../core/interfaces/product';
import Swal from 'sweetalert2';


// ✅ IMPORTS REQUERIDOS para standalone
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';


@Component({
  selector: 'app-modal-purchase',
  standalone: true,
  templateUrl: './modal-purchase.component.html',
  styleUrls: ['./modal-purchase.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class ModalPurchaseComponent implements OnInit {
  purchaseForm!: FormGroup;
  products: Product[] = [];
  isLoading = false;
  isEditing = false;
  modalTitle = 'Nueva Compra';


  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private productService: ProductService,
    public dialogRef: MatDialogRef<ModalPurchaseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IPurchase | null
  ) {}


  ngOnInit(): void {
    this.loadProducts();
    this.initForm();


    if (this.data) {
      this.isEditing = true;
      this.modalTitle = 'Editar Compra';
      this.populateForm();
    }
  }


  // Validador personalizado para evitar espacios en blanco únicamente
  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }


  initForm(): void {
    this.purchaseForm = this.fb.group({
      id: [null],
      name: ['', [
        Validators.required,
        this.noWhitespaceValidator,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)
      ]],
      lastName: ['', [
        Validators.required,
        this.noWhitespaceValidator,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/)
      ]],
      phone: ['', [
      Validators.required,
      Validators.pattern(/^[0-9]*$/),           // Solo números
      Validators.maxLength(9),                 // Máximo 9 dígitos
      Validators.pattern(/^9[0-9]{8}$/)        // Empieza con 9 y tiene 9 dígitos exactos
      ]],

      address: ['', [
        Validators.required,
        this.noWhitespaceValidator
      ]],
      operationType: ['COMPRA', Validators.required],
      datePurchase: [new Date(), Validators.required], // ✅ Aquí
      status: ['A'],
      purchaseDetails: this.fb.array([])
    });


    this.addDetail();
  }


  populateForm(): void {
    if (!this.data) return;


    this.purchaseForm.patchValue({
      id: this.data.id,
      name: this.data.name,
      lastName: this.data.lastName,
      phone: this.data.phone,
      address: this.data.address,
      operationType: this.data.operationType,
      datePurchase: new Date(this.data.datePurchase), // ✅ agregado
      status: this.data.status
    });


    this.detailsFormArray.clear();


    if (this.data.purchaseDetails?.length) {
      this.data.purchaseDetails.forEach(detail => {
        this.detailsFormArray.push(this.createDetailForm(
          detail.id,
          detail.productId,
          detail.productQuantity,
          detail.purchasePrice
        ));
      });
    } else {
      this.addDetail();
    }
  }


  loadProducts(): void {
  this.productService.getAllProducts().subscribe({
    next: data => {
      this.products = data.filter(product => product.status === 'A'); // Filtra solo los activos
      if (this.products.length === 0) {
        Swal.fire('Información', 'No hay productos activos disponibles', 'info');
      }
    },
    error: err => {
      console.error('Error al cargar productos', err);
      Swal.fire('Error', 'No se pudieron cargar los productos', 'error');
    }
  });
}



  get detailsFormArray(): FormArray {
    return this.purchaseForm.get('purchaseDetails') as FormArray;
  }


  createDetailForm(id: number | null = null, productId: number | null = null, productQuantity: number = 1, purchasePrice: number = 0): FormGroup {
    return this.fb.group({
      id: [id],
      productId: [productId, Validators.required],
      productQuantity: [productQuantity, [Validators.required, Validators.min(1)]],
      purchasePrice: [purchasePrice, [Validators.required, Validators.min(0.1)]],
      subtotal: [{ value: productQuantity * purchasePrice, disabled: true }]
    });
  }


  addDetail(): void {
    const detailGroup = this.fb.group({
      productId: [null, Validators.required],
      productQuantity: [1, [Validators.required, Validators.min(1)]],
      purchasePrice: [0, [Validators.required, Validators.min(0.1)]],
      subtotal: [{ value: 0, disabled: true }]
    });


    detailGroup.valueChanges.subscribe(values => {
      const subtotal = (values.productQuantity ?? 0) * (values.purchasePrice ?? 0);
      detailGroup.get('subtotal')?.setValue(subtotal, { emitEvent: false });
    });


    this.detailsFormArray.push(detailGroup);
  }


  removeDetail(index: number): void {
    if (this.detailsFormArray.length > 1) {
      this.detailsFormArray.removeAt(index);
    } else {
      Swal.fire('Información', 'Debe haber al menos un detalle en la compra', 'info');
    }
  }


  calculateTotal(): number {
    return this.detailsFormArray.controls.reduce((total, control) => {
      const { productQuantity, purchasePrice } = control.value;
      return total + (productQuantity * purchasePrice);
    }, 0);
  }

  formatDateForBackend(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


  onSubmit(): void {
    if (this.purchaseForm.invalid) {
      Swal.fire('Error', 'Por favor complete todos los campos requeridos correctamente', 'error');
      return;
    }


    this.isLoading = true;
    const rawData = this.purchaseForm.getRawValue();

const formData = {
  ...rawData,
  datePurchase: this.formatDateForBackend(new Date(rawData.datePurchase)),
  purchaseDetails: rawData.purchaseDetails.map((d: any) => ({
    ...d,
    subtotal: d.productQuantity * d.purchasePrice
    }))
    };


    const request = this.isEditing
      ? this.purchaseService.updatePurchase(formData.id, formData)
      : this.purchaseService.createPurchase(formData);


    request.subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('¡Éxito!', `Compra ${this.isEditing ? 'actualizada' : 'creada'} correctamente`, 'success');
        this.dialogRef.close('refresh');
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error guardando compra', err);
        Swal.fire('Error', 'No se pudo guardar la compra', 'error');
      }
    });
  }


  cancel(): void {
    this.dialogRef.close();
  }
}
