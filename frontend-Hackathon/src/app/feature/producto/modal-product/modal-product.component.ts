import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../../../core/interfaces/product';
import { ProductService } from '../../../core/services/product.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-product',
  templateUrl: './modal-product.component.html',
  styleUrls: ['./modal-product.component.css'],
  standalone: false
})
export class ModalProductComponent implements OnInit {
  productForm: FormGroup;
  isEditMode: boolean = false;
  title: string = 'Agregar Producto';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private dialogRef: MatDialogRef<ModalProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: Product }
  ) {
    this.dialogRef.updateSize('90%', 'auto');

    this.productForm = this.fb.group({
      id: [null],
      name: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
      ]],
      category: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
      ]],
      description: ['', [
        Validators.required,
        Validators.maxLength(300)
      ]],
      brand: ['', [
        Validators.required,
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s-]+$/)
      ]],
      price: ['', [
        Validators.required,
        Validators.pattern(/^\d+(\.\d{1,2})?$/)
      ]],
      unit_measurement: ['', [
        Validators.required,
        Validators.maxLength(20)
      ]],
      code_product: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(6),
        Validators.pattern(/^[a-zA-Z0-9_-]+$/)
      ]],
      stock: ['', [
        Validators.required,
        Validators.pattern(/^\d+$/)
      ]],
      status: ['A']
    });
  }

  ngOnInit() {
    if (this.data && this.data.product) {
      this.isEditMode = true;
      this.title = 'Editar Producto';
      this.productForm.patchValue(this.data.product);
    }
  }

  save() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos correctamente.', 'error');
      return;
    }

    const formValues = this.productForm.value;

    if (this.isEditMode) {
      const product: Product = formValues;
      const productId = product.id;

      this.productService.updateProduct(productId, product).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Producto actualizado correctamente', 'success');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al actualizar producto:', error);
          Swal.fire('Error', 'No se pudo actualizar el producto', 'error');
        }
      });
    } else {
      const { id, ...productWithoutId } = formValues;

      this.productService.createProduct(productWithoutId as Product).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Producto agregado correctamente', 'success');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear producto:', error);
          Swal.fire('Error', 'No se pudo crear el producto', 'error');
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.productForm.get(controlName)?.hasError(errorName)
      && this.productForm.get(controlName)?.touched || false;
  }
}
