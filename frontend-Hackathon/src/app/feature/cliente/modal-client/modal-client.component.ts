import { Component, Inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Customer } from '../../../core/interfaces/customer';
import { CustomerService } from '../../../core/services/customer.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-client',
  templateUrl: './modal-client.component.html',
  styleUrls: ['./modal-client.component.css'],
  standalone: false
})
export class ModalClientComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode: boolean = false;
  title: string = 'Agregar Cliente';

  documentTypes: string[] = ['DNI', 'Pasaporte', 'RUC'];

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private dialogRef: MatDialogRef<ModalClientComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer: Customer }
  ) {
    this.dialogRef.updateSize('90%', 'auto');

    this.customerForm = this.fb.group({
  id: [null],
  name: ['', [
    Validators.required,
    Validators.maxLength(100),
    Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/),
    this.noSoloEspacios()
  ]],
  lastName: ['', [
    Validators.required,
    Validators.maxLength(100),
    Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/),
    this.noSoloEspacios()
  ]],
  documentType: ['DNI', Validators.required],
  numberDocument: ['', [
    Validators.required,
    Validators.pattern(/^\d{8}$/)
  ]],
  birthdate: ['', [Validators.required, this.ageValidator(18)]],
  phone: ['', [
    Validators.required,
    Validators.pattern(/^9\d{8}$/)
  ]],
  email: ['', [
    Validators.required,
    Validators.email,
    Validators.maxLength(100)
  ]],
  address: ['', [
    Validators.required,
    Validators.maxLength(200),
    this.noSoloEspacios()
  ]],
  status: ['A']
});

  }
  noSoloEspacios(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && typeof control.value === 'string') {
        const trimmed = control.value.trim();
        return trimmed.length > 0 ? null : { soloEspacios: true };
      }
      return null;
    };
  }

  ngOnInit() {
  if (this.data && this.data.customer) {
    this.isEditMode = true;
    this.title = 'Editar Cliente';
    this.customerForm.patchValue(this.data.customer);

    if (this.data.customer.birthdate) {
      const date = new Date(this.data.customer.birthdate);
      const formattedDate = date.toISOString().split('T')[0];
      this.customerForm.get('birthdate')?.setValue(formattedDate);
    }
  }

  this.customerForm.get('documentType')?.valueChanges.subscribe(type => {
    const docControl = this.customerForm.get('numberDocument');

    if (type === 'DNI') {
      docControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{8}$/) // exactamente 8 dígitos
      ]);
    } else if (type === 'RUC') {
      docControl?.setValidators([
        Validators.required,
        Validators.pattern(/^\d{11}$/) // exactamente 11 dígitos
      ]);
    } else if (type === 'Pasaporte') {
      docControl?.setValidators([
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]{1,8}$/) // hasta 8 alfanuméricos
      ]);
    }

    docControl?.updateValueAndValidity();
  });

  // Asegurar que la validación se aplique al editar
  const currentType = this.customerForm.get('documentType')?.value;
  this.customerForm.get('documentType')?.setValue(currentType);
}


  save() {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      Swal.fire('Error', 'Por favor, complete todos los campos requeridos correctamente.', 'error');
      return;
    }

    // Clonar los valores para no modificar directamente el formulario
    const formValues = { ...this.customerForm.value };

    // Formatear la fecha para quitar hora y zona
    if (formValues.birthdate) {
      const d = new Date(formValues.birthdate);
      formValues.birthdate = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
    }
    console.log('Fecha a enviar:', formValues.birthdate);

    if (this.isEditMode) {
      // En modo edición el id debe existir
      const customerId = formValues.id;

      this.customerService.updateCustomer(customerId, formValues).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Cliente actualizado correctamente', 'success');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al actualizar cliente:', error);
          Swal.fire('Error', 'No se pudo actualizar el cliente', 'error');
        }
      });
    } else {
      // En creación, eliminar id si está presente
      const { id, ...customerWithoutId } = formValues;

      this.customerService.createCustomer(customerWithoutId).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Cliente agregado correctamente', 'success');
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Error al crear cliente:', error);
          Swal.fire('Error', 'No se pudo crear el cliente', 'error');
        }
      });
    }
  }

  cancel() {
    this.dialogRef.close(false);
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.customerForm.get(controlName)?.hasError(errorName)
      && this.customerForm.get(controlName)?.touched || false;
  }
  get documentTypeValue(): string {
  return this.customerForm.get('documentType')?.value || '';
}


  // ✅ Validador personalizado para edad mínima
  private ageValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= minAge ? null : { ageNotValid: true };
    };
  }
}
