// ✅ estudiantes.component.ts actualizado como Standalone
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Students } from '../../core/interfaces/students';
import { StudentsService } from '../../core/services/students.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ModalEstudiantesComponent } from './modal-estudiante/modal-estudiante.component';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  templateUrl: './estudiantes.component.html',
  styleUrls: ['./estudiantes.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatPaginatorModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatSlideToggleModule,       // ✅ solucion para mat-slide-toggle
    MatCardModule,              // ✅ solucion para mat-card y mat-card-content
    MatProgressSpinnerModule,   // ✅ solucion para mat-spinner
    ModalEstudiantesComponent   // ✅ modal como standalone
  ]
})
export class EstudiantesComponent implements OnInit, AfterViewInit {
  estudiantesOriginales: Students[] = [];
  dataSource: MatTableDataSource<Students> = new MatTableDataSource<Students>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayedColumns: string[] = [
    'idEstudiante',
    'dni',
    'nombres',
    'apellidos',
    'fechaNacimiento',
    'correo',
    'telefono',
    'programa',
    'ubigeo',
    'estado',
    'acciones'
  ];

  mostrarActivos: boolean = true;
  terminoBusqueda: string = '';
  searchTerms = new Subject<string>();
  cargando: boolean = false;

  constructor(
    private studentsService: StudentsService,
    private dialog: MatDialog
  ) {
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.terminoBusqueda = term;
      this.aplicarFiltros();
    });
  }

  ngOnInit(): void {
    this.obtenerEstudiantes();
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  buscar(event: any): void {
    const valor = event.target.value;
    this.searchTerms.next(valor);
  }

  obtenerEstudiantes(): void {
    this.cargando = true;
    this.studentsService.getAllStudents().subscribe({
      next: (data) => {
        this.estudiantesOriginales = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener estudiantes:', error);
        Swal.fire('Error', 'No se pudo cargar la lista de estudiantes.', 'error');
        this.cargando = false;
      }
    });
  }

  toggleStatus(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let filtrados = this.estudiantesOriginales.filter(est =>
      this.mostrarActivos ? est.estado === 'A' : est.estado === 'I');

    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      filtrados = filtrados.filter(est =>
        est.nombres.toLowerCase().includes(termino) ||
        est.apellidos.toLowerCase().includes(termino) ||
        est.dni.toLowerCase().includes(termino) ||
        est.correo.toLowerCase().includes(termino)
      );
    }

    this.dataSource.data = filtrados;

    if (this.paginator && this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  eliminarEstudiante(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'El estudiante será desactivado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.studentsService.deleteStudent(id).subscribe({
          next: () => {
            Swal.fire('Desactivado', 'El estudiante fue desactivado correctamente.', 'success');
            this.obtenerEstudiantes();
          },
          error: (error) => {
            console.error('Error al desactivar:', error);
            Swal.fire('Error', 'No se pudo desactivar el estudiante.', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  restaurarEstudiante(id: number): void {
    Swal.fire({
      title: '¿Restaurar estudiante?',
      text: 'El estudiante volverá a estar activo.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.studentsService.restoreStudent(id).subscribe({
          next: () => {
            Swal.fire('Restaurado', 'El estudiante fue restaurado correctamente.', 'success');
            this.obtenerEstudiantes();
          },
          error: (error) => {
            console.error('Error al restaurar:', error);
            Swal.fire('Error', 'No se pudo restaurar el estudiante.', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  agregarEstudiante(): void {
    const dialogRef = this.dialog.open(ModalEstudiantesComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'responsive-dialog',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerEstudiantes();
      }
    });
  }

  editarEstudiante(id: number): void {
    const estudiante = this.dataSource.data.find(e => e.idEstudiante === id);
    if (!estudiante) return;

    const dialogRef = this.dialog.open(ModalEstudiantesComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'responsive-dialog',
      disableClose: true,
      data: { student: estudiante }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerEstudiantes();
      }
    });
  }
}
