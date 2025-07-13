import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { IPurchase } from '../../../app/core/interfaces/purchase';
import { PurchaseService } from '../../../app/core/services/purchase.service';
import Swal from 'sweetalert2';
import { ModalPurchaseComponent } from './modal-purchase/modal-purchase.component';
import { PurchaseDetailComponent } from './purchase-detail/purchase-detail.component';


// Standalone modules
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatProgressSpinnerModule,
    PurchaseDetailComponent,
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
export class CompraComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['id', 'datePurchase', 'name', 'lastName', 'operationType', 'totalAmount', 'status', 'actions', 'download'];
  displayedColumnsMobile: string[] = ['id', 'totalAmount', 'status', 'actions', 'download'];
  currentDisplayColumns: string[] = [];


  dataSource = new MatTableDataSource<IPurchase>([]);
  originalData: IPurchase[] = [];


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('statusToggle') statusToggleGroup!: MatButtonToggleGroup;


  isLoading = true;
  error: string | null = null;
  isMobile = false;
  statusFilter: string = 'A';


  constructor(
    private purchaseService: PurchaseService,
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


    this.purchaseService.getAllPurchases().subscribe({
      next: (purchases) => {
        this.originalData = [...purchases];
        this.filterData();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Error al cargar las compras: ' + err.message;
        this.isLoading = false;
        Swal.fire('Error', this.error, 'error');
      }
    });
  }


  filterData(): void {
    if (!this.originalData || this.originalData.length === 0) return;


    let filteredData: IPurchase[];


    if (this.statusFilter === 'all') {
      filteredData = [...this.originalData];
    } else {
      filteredData = this.originalData.filter(purchase => purchase.status === this.statusFilter);
    }


    this.dataSource.data = filteredData;


    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  applyStatusFilter(): void {
    this.filterData();
  }


  calculateTotalAmount(purchase: IPurchase): number {
    if (!purchase.purchaseDetails) return 0;
    return purchase.purchaseDetails.reduce((total, detail) => total + (detail.subtotal || 0), 0);
  }


  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();


    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  viewPurchaseDetails(purchase: IPurchase): void {
    const dialogRef = this.dialog.open(PurchaseDetailComponent, {
      width: '90%',
      maxWidth: '800px',
      data: {
        ...purchase,
        totalAmount: this.calculateTotalAmount(purchase)
      },
      disableClose: false,
      autoFocus: true,
      panelClass: 'custom-dialog-container',
      hasBackdrop: true,
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadData();
      }
    });
  }


  deletePurchase(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la compra permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.purchaseService.deletePurchase(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'La compra ha sido eliminada.', 'success');
            this.loadData();
          },
          error: (err: any) => {
            this.error = 'Error al eliminar la compra: ' + err.message;
            Swal.fire('Error', this.error, 'error');
          }
        });
      }
    });
  }


  restorePurchase(id: number): void {
    Swal.fire({
      title: '¿Restaurar esta compra?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.purchaseService.restorePurchase(id).subscribe({
          next: () => {
            Swal.fire('¡Restaurado!', 'La compra ha sido restaurada.', 'success');
            this.loadData();
          },
          error: (err: any) => {
            this.error = 'Error al restaurar la compra: ' + err.message;
            Swal.fire('Error', this.error, 'error');
          }
        });
      }
    });
  }


  togglePurchaseStatus(purchase: IPurchase, newStatus: 'A' | 'I'): void {
    const action = newStatus === 'I' ? 'inactivar' : 'activar';


    Swal.fire({
      title: `¿Estás seguro de ${action} esta compra?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: newStatus === 'I' ? '#d33' : '#3085d6'
    }).then(result => {
      if (result.isConfirmed) {
        const updatedPurchase: IPurchase = {
          ...purchase,
          status: newStatus
        };


        this.purchaseService.updatePurchase(purchase.id, updatedPurchase).subscribe({
          next: () => {
            Swal.fire('¡Actualizado!', `La compra ha sido ${action === 'inactivar' ? 'inactivada' : 'activada'} correctamente.`, 'success');
            this.loadData();
          },
          error: (err: any) => {
            this.error = `Error al ${action} la compra: ` + err.message;
            Swal.fire('Error', this.error, 'error');
          }
        });
      }
    });
  }


  openPurchaseModal(purchase?: IPurchase): void {
    const dialogRef = this.dialog.open(ModalPurchaseComponent, {
      width: '90%',
      maxWidth: '900px',
      data: purchase || null,
      disableClose: true
    });


    dialogRef.afterClosed().subscribe(result => {
      if (result === 'refresh') {
        this.loadData();
      }
    });
  }


  descargarCompra(purchaseId: number): void {
  this.purchaseService.descargarCompraPDF(purchaseId).subscribe({
    next: (data: Blob) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);


      const a = document.createElement('a');
      a.href = url;
      a.download = `boleta_${purchaseId}.pdf`;
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


