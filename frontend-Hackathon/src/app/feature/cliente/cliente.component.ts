import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Customer } from '../../core/interfaces/customer';
import { CustomerService } from '../../core/services/customer.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalClientComponent } from './modal-client/modal-client.component';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { saveAs } from 'file-saver';


@Component({
    selector: 'app-cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.css'],
    standalone: false
})
export class ClienteComponent implements OnInit, AfterViewInit {
  // Listas de clientes
  clientesOriginales: Customer[] = [];   // Lista completa de todos los clientes
  
  // DataSource para la tabla con paginación - Inicializado con array vacío
  dataSource: MatTableDataSource<Customer> = new MatTableDataSource<Customer>([]);
  
  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Configuración de la tabla
  displayedColumns: string[] = [
    'id',
    'name',
    'lastName',
    'documentType',
    'numberDocument',
    'birthdate',
    'phone',
    'email',
    'address',
    'status',
    'acciones'
  ];

  // Estados y filtros
  mostrarActivos: boolean = true;
  terminoBusqueda: string = '';
  searchTerms = new Subject<string>();

  // Estado de carga
  cargando: boolean = false;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {
    // Configurar el observable para búsqueda con debounce
    this.searchTerms.pipe(
      debounceTime(300),        // Esperar 300ms después de cada pulsación
      distinctUntilChanged()    // Ignorar si el término no ha cambiado
    ).subscribe(term => {
      this.terminoBusqueda = term;
      this.aplicarFiltros();
    });
  }

  ngOnInit(): void {
    this.obtenerClientes();
  }
  
  ngAfterViewInit(): void {
    // Conectar el paginador con el dataSource solo si existe
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // Método para buscar
  buscar(event: any): void {
    const valor = event.target.value;
    this.searchTerms.next(valor);
  }

  obtenerClientes(): void {
    this.cargando = true;
    this.customerService.getAllCustomers().subscribe({
      next: (data) => {
        this.clientesOriginales = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener clientes:', error);
        Swal.fire('Error', 'No se pudo cargar la lista de clientes.', 'error');
        this.cargando = false;
      }
    });
  }

  toggleStatus(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    // Primero filtramos por estado (activo/inactivo)
    let clientesFiltrados = this.clientesOriginales.filter(cliente =>
      this.mostrarActivos ? cliente.status === 'A' : cliente.status === 'I');

    // Luego aplicamos el filtro de búsqueda si existe
    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      clientesFiltrados = clientesFiltrados.filter(cliente =>
        cliente.name.toLowerCase().includes(termino) ||
        cliente.lastName.toLowerCase().includes(termino) ||
        cliente.numberDocument.toLowerCase().includes(termino) ||
        cliente.email.toLowerCase().includes(termino) ||
        cliente.phone.toLowerCase().includes(termino)
      );
    }

    // Asignar los datos filtrados al dataSource
    this.dataSource.data = clientesFiltrados;
    
    // Si el paginador ya está inicializado, volver a la primera página
    if (this.paginator && this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  eliminarCliente(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'El cliente será desactivado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.customerService.deleteCustomer(id).subscribe({
          next: () => {
            Swal.fire('Desactivado', 'El cliente fue desactivado correctamente.', 'success');
            this.obtenerClientes();
          },
          error: (error) => {
            console.error('Error al desactivar:', error);
            Swal.fire('Error', 'No se pudo desactivar el cliente.', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  restaurarCliente(id: number): void {
    Swal.fire({
      title: '¿Restaurar cliente?',
      text: 'El cliente volverá a estar activo.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.customerService.restoreCustomer(id).subscribe({
          next: () => {
            Swal.fire('Restaurado', 'El cliente fue restaurado correctamente.', 'success');
            this.obtenerClientes();
          },
          error: (error) => {
            console.error('Error al restaurar:', error);
            Swal.fire('Error', 'No se pudo restaurar el cliente.', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  // Método actualizado para abrir el modal de forma responsive
  agregarCliente(): void {
    const dialogRef = this.dialog.open(ModalClientComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'responsive-dialog',
      disableClose: true,
      data: {} // Sin datos para un cliente nuevo
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerClientes(); // Recargar la lista si se guardó un cliente
      }
    });
  }

  // Método actualizado para abrir el modal de forma responsive
  editarCliente(id: number): void {
    const cliente = this.dataSource.data.find(c => c.id === id);
    if (!cliente) return;

    const dialogRef = this.dialog.open(ModalClientComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'responsive-dialog',
      disableClose: true,
      data: { customer: cliente }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerClientes(); // Recargar la lista si se editó el cliente
      }
    });
  }
  descargarReporteClientes() {
  const estado = this.mostrarActivos ? 'A' : 'I'; // CAMBIO AQUÍ

  this.customerService.downloadCustomerReportByStatus(estado).subscribe(
    (response) => {
      const blob = new Blob([response], { type: 'application/pdf' });
      const fileName = `reporte_clientes_${estado === 'A' ? 'activos' : 'inactivos'}.pdf`;
      saveAs(blob, fileName);
    },
    (error) => {
      console.error('Error al descargar el reporte', error);
    }
  );
}


}