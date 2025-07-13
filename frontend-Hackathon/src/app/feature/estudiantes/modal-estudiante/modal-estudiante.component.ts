import { Component, Inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  ValidationErrors,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Students } from '../../../core/interfaces/students';
import { StudentsService } from '../../../core/services/students.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

// Angular Material Modules
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatOptionModule } from '@angular/material/core';

@Component({
  selector: 'app-modal-estudiantes',
  standalone: true,
  templateUrl: './modal-estudiante.component.html',
  styleUrls: ['./modal-estudiante.component.css'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatOptionModule
  ]
})
export class ModalEstudiantesComponent {
  studentForm: FormGroup;
  isEditMode: boolean = false;
  title: string = 'Agregar Estudiante';
  documentTypes: string[] = ['DNI', 'Pasaporte', 'RUC'];

  programas: any[] = [];
  ubigeos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private studentsService: StudentsService,
    private dialogRef: MatDialogRef<ModalEstudiantesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { student: Students }
  ) {
    this.dialogRef.updateSize('90%', 'auto');

    this.studentForm = this.fb.group({
      idEstudiante: [null],
      nombres: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/), this.noSoloEspacios()]],
      apellidos: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-ZÁÉÍÓÚáéíóúñÑ\s]+$/), this.noSoloEspacios()]],
      documento: ['DNI', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      fechaNacimiento: ['', [Validators.required, this.ageValidator(18)]],
      telefono: ['', [Validators.required, Validators.pattern(/^9\d{8}$/)]],
      correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      idPrograma: ['', Validators.required],
      idUbigeo: ['', Validators.required],
      estado: ['A']
    });

    // ✅ Cargar valores al editar SIN acceder a propiedades que no existen
if (this.data && this.data.student) {
  this.isEditMode = true;
  this.title = 'Editar Estudiante';

  const studentData = {
    ...this.data.student,
    idPrograma: this.data.student.programa?.idPrograma,
    idUbigeo: this.data.student.ubigeo?.idUbigeo,
    fechaNacimiento: this.formatFecha(this.data.student.fechaNacimiento)
  };

  this.studentForm.patchValue(studentData);
}


    // ✅ Validación dinámica del documento
    this.studentForm.get('documento')?.valueChanges.subscribe(tipo => {
      const docControl = this.studentForm.get('dni');

      if (tipo === 'DNI') {
        docControl?.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
      } else if (tipo === 'RUC') {
        docControl?.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
      } else if (tipo === 'Pasaporte') {
        docControl?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9]{1,8}$/)]);
      }

      docControl?.updateValueAndValidity();
    });

    // 🔽 Puedes reemplazar esto con datos reales desde el backend
    this.programas = [
      { idPrograma: 1, nombre: 'Ingeniería' },
      { idPrograma: 2, nombre: 'Contabilidad' }
    ];

    this.ubigeos = [
      { idUbigeo: 1, departamento: 'Lima', provincia: 'Lima', distrito: 'Miraflores' },
      { idUbigeo: 2, departamento: 'Arequipa', provincia: 'Arequipa', distrito: 'Cayma' }
    ];
  }

save(): void {
  if (this.studentForm.invalid) {
    this.studentForm.markAllAsTouched();
    Swal.fire('Error', 'Por favor completa todos los campos correctamente.', 'error');
    return;
  }

  const form = { ...this.studentForm.value };

  // Formatear fecha
  if (form.fechaNacimiento) {
    const d = new Date(form.fechaNacimiento);
    form.fechaNacimiento = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  }

  // Convertir ID a objetos como espera Spring Boot
  form.programa = { idPrograma: form.idPrograma };
  form.ubigeo = { idUbigeo: form.idUbigeo };
  delete form.idPrograma;
  delete form.idUbigeo;

  if (this.isEditMode) {
    const id = form.idEstudiante;
    this.studentsService.updateStudent(id, form).subscribe({
      next: () => {
        Swal.fire('¡Actualizado!', 'Estudiante actualizado correctamente.', 'success');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error actualizando:', err);
        Swal.fire('Error', 'No se pudo actualizar el estudiante.', 'error');
      }
    });
  } else {
    delete form.idEstudiante;
    this.studentsService.createStudent(form).subscribe({
      next: () => {
        Swal.fire('¡Guardado!', 'Estudiante agregado correctamente.', 'success');
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('Error creando estudiante:', err); // 🔎 Aquí vemos el error exacto
        Swal.fire('Error', 'No se pudo agregar el estudiante.', 'error');
      }
    });
  }
}


  cancel(): void {
    this.dialogRef.close(false);
  }

  hasError(controlName: string, errorName: string): boolean {
    return this.studentForm.get(controlName)?.hasError(errorName) && this.studentForm.get(controlName)?.touched || false;
  }

  private noSoloEspacios(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const valor = control.value?.trim();
      return valor && valor.length > 0 ? null : { soloEspacios: true };
    };
  }

  private ageValidator(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fecha = new Date(control.value);
      const hoy = new Date();
      let edad = hoy.getFullYear() - fecha.getFullYear();
      const m = hoy.getMonth() - fecha.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < fecha.getDate())) {
        edad--;
      }
      return edad >= minAge ? null : { edadInvalida: true };
    };
  }

  private formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toISOString().split('T')[0];
  }
}
