import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { ISale } from '../../../app/core/interfaces/sale';
import { SaleService } from '../../../app/core/services/sale.service';
import { Customer } from '../../../app/core/interfaces/customer';
import { CustomerService } from '../../../app/core/services/customer.service';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { ModalSaleComponent } from './modal-sale/modal-sale.component';
import { FormsModule } from '@angular/forms'; 


// Importaciones necesarias para standalone
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SaleDetailComponent } from './sale-detail/sale-detail.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    SaleDetailComponent,
    MatPaginatorModule,
    MatSortModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
  ]
})

export class VentaComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'dateSale', 'customerName', 'paymentMethod', 'totalAmount', 'status', 'actions', 'download'];
  displayedColumnsMobile: string[] = ['id', 'dateSale', 'totalAmount', 'status', 'actions', 'download'];
  currentDisplayColumns: string[] = [];

  dataSource = new MatTableDataSource<ISaleWithCustomerName>([]);
  originalData: ISaleWithCustomerName[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('statusToggle') statusToggleGroup!: MatButtonToggleGroup;

  isLoading = true;
  error: string | null = null;
  isMobile = false;
  statusFilter: string = 'A';

  customers: Customer[] = [];

  constructor(
    private saleService: SaleService,
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', () => this.checkScreenSize());
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    this.currentDisplayColumns = this.isMobile ? this.displayedColumnsMobile : this.displayedColumns;
  }

  loadData(): void {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      sales: this.saleService.getAllSales(),
      customers: this.customerService.getAllCustomers()
    }).subscribe({
      next: (results) => {
        this.customers = results.customers;

        const enrichedSales: ISaleWithCustomerName[] = results.sales
          .sort((a, b) => b.id - a.id) 
          .map(sale => {
        const customer = this.customers.find(c => c.id === sale.customerId);
          return {
            ...sale,
          customerName: customer ? `${customer.name} ${customer.lastName}` : 'Cliente desconocido'
        };
      });



        this.originalData = [...enrichedSales];
        this.filterData();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar los datos: ' + err.message;
        this.isLoading = false;
        console.error('Error loading data:', err);
        Swal.fire('Error', this.error, 'error');
      }
    });
  }

  filterData(): void {
    if (!this.originalData || this.originalData.length === 0) return;

    let filteredData: ISaleWithCustomerName[];

    if (this.statusFilter === 'all') {
      filteredData = [...this.originalData];
    } else {
      filteredData = this.originalData.filter(sale => sale.status === this.statusFilter);
    }

    this.dataSource.data = filteredData;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  applyStatusFilter(): void {
    this.filterData();
  }

  calculateTotalAmount(sale: ISale): number {
    if (!sale.saleDetails) return 0;
    return sale.saleDetails.reduce((total, detail) => {
      return total + (detail.amount * (detail.saleCost || 0));
    }, 0);
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  viewSaleDetails(sale: ISaleWithCustomerName): void {
    const dialogRef = this.dialog.open(SaleDetailComponent, {
      width: '90%',
      maxWidth: '800px',
      data: {
        ...sale,
        customerName: sale.customerName,
        totalAmount: this.calculateTotalAmount(sale)
      },
      disableClose: false,
      autoFocus: true,
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
    });

    dialogRef.afterClosed().subscribe((result: ISale | 'refresh' | null) => {
  if (result && typeof result !== 'string') {
    const customer = this.customers.find(c => c.id === result.customerId);
    const enrichedSale: ISaleWithCustomerName = {
      ...result,
      customerName: customer ? `${customer.name} ${customer.lastName}` : 'Cliente desconocido'
    };

    this.originalData.unshift(enrichedSale); // Insertar al inicio
    this.filterData(); // Aplicar el filtro actual
  } else if (result === 'refresh') {
    this.loadData(); // fallback si algo sale mal
  }
});

  }

  deleteSale(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la venta permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.saleService.deleteSale(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La venta ha sido eliminada permanentemente.', 'success');
            this.loadData();
          },
          error: (err: any) => {
            this.error = 'Error al eliminar la venta: ' + err.message;
            console.error('Error deleting sale:', err);
            Swal.fire('Error', this.error, 'error');
          }
        });
      }
    });
  }

    restoreSale(id: number): void {
    Swal.fire({
      title: '¿Restaurar esta venta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.saleService.restoreSale(id).subscribe({
          next: () => {
            Swal.fire('¡Restaurado!', 'La venta ha sido restaurada.', 'success');
            this.loadData();
          },
          error: (err: any) => {
            this.error = 'Error al restaurar la venta: ' + err.message;
            console.error('Error restoring sale:', err);
            Swal.fire('Error', this.error, 'error');
          }
        });
      }
    });
  }

  toggleSaleStatus(sale: ISaleWithCustomerName, newStatus: 'A' | 'I'): void {
    const action = newStatus === 'I' ? 'inactivar' : 'activar';

    Swal.fire({
      title: `¿Estás seguro de ${action} esta venta?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: newStatus === 'I' ? '#d33' : '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        const updatedSale: ISale = {
          ...sale,
          status: newStatus
        };

        this.saleService.updateSale(sale.id, updatedSale).subscribe({
          next: () => {
            Swal.fire('¡Actualizado!', `La venta ha sido ${newStatus === 'I' ? 'inactivada' : 'activada'} correctamente.`, 'success');
            this.loadData();
          },
          error: (err: any) => {
            this.error = `Error al ${action} la venta: ` + err.message;
            console.error(`Error ${action} sale:`, err);
            Swal.fire('Error', this.error, 'error');
          }
        });
      }
    });
  }

  openSaleModal(sale?: ISaleWithCustomerName): void {
    const dialogRef = this.dialog.open(ModalSaleComponent, {
      width: '90%',
      maxWidth: '900px',
      data: sale || null,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadData();
      }
    });
  }
  descargarBoleta(saleId: number): void {
  this.saleService.descargarBoletaPDF(saleId).subscribe({
    next: (data: Blob) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_${saleId}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Error al descargar boleta:', err);
      Swal.fire('Error', 'No se pudo descargar la boleta.', 'error');
    }
  });
}

}

interface ISaleWithCustomerName extends ISale {
  customerName: string;
}