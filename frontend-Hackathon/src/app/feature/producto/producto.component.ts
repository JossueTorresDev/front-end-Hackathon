import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Product } from '../../core/interfaces/product';
import { ProductService } from '../../core/services/product.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalProductComponent } from './modal-product/modal-product.component';
import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
  standalone: false
})
export class ProductoComponent implements OnInit, AfterViewInit {
  // Lista completa de productos
  productosOriginales: Product[] = [];

  // DataSource para la tabla
  dataSource: MatTableDataSource<Product> = new MatTableDataSource<Product>([]);

  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Configuración de columnas
  displayedColumns: string[] = [
    'id',
    'name',
    'category',
    'description',
    'brand',
    'price',
    'unit_measurement',
    'code_product',
    'stock',
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
    private productService: ProductService,
    private dialog: MatDialog
  ) {
    // Debounce para búsqueda
    this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(term => {
      this.terminoBusqueda = term;
      this.aplicarFiltros();
    });
  }

  ngOnInit(): void {
    this.obtenerProductos();
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

  obtenerProductos(): void {
    this.cargando = true;
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.productosOriginales = data;
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener productos:', error);
        Swal.fire('Error', 'No se pudo cargar la lista de productos.', 'error');
        this.cargando = false;
      }
    });
  }

  toggleStatus(): void {
    this.mostrarActivos = !this.mostrarActivos;
    this.aplicarFiltros();
  }

  aplicarFiltros(): void {
    let productosFiltrados = this.productosOriginales.filter(producto =>
      this.mostrarActivos ? producto.status === 'A' : producto.status === 'I'
    );

    if (this.terminoBusqueda && this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase().trim();
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.name.toLowerCase().includes(termino) ||
        producto.category.toLowerCase().includes(termino) ||
        producto.description.toLowerCase().includes(termino) ||
        producto.brand.toLowerCase().includes(termino) ||
        producto.code_product.toLowerCase().includes(termino)
      );
    }

    this.dataSource.data = productosFiltrados;

    if (this.paginator && this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  eliminarProducto(id: number): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'El producto será desactivado.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.productService.deleteProduct(id).subscribe({
          next: () => {
            Swal.fire('Desactivado', 'El producto fue desactivado correctamente.', 'success');
            this.obtenerProductos();
          },
          error: (error) => {
            console.error('Error al desactivar:', error);
            Swal.fire('Error', 'No se pudo desactivar el producto.', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  restaurarProducto(id: number): void {
    Swal.fire({
      title: '¿Restaurar producto?',
      text: 'El producto volverá a estar activo.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.cargando = true;
        this.productService.restoreProduct(id).subscribe({
          next: () => {
            Swal.fire('Restaurado', 'El producto fue restaurado correctamente.', 'success');
            this.obtenerProductos();
          },
          error: (error) => {
            console.error('Error al restaurar:', error);
            Swal.fire('Error', 'No se pudo restaurar el producto.', 'error');
            this.cargando = false;
          }
        });
      }
    });
  }

  agregarProducto(): void {
    const dialogRef = this.dialog.open(ModalProductComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'responsive-dialog',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProductos();
      }
    });
  }

  editarProducto(id: number): void {
    const producto = this.dataSource.data.find(p => p.id === id);
    if (!producto) return;

    const dialogRef = this.dialog.open(ModalProductComponent, {
      width: '90%',
      maxWidth: '800px',
      maxHeight: '90vh',
      panelClass: 'responsive-dialog',
      disableClose: true,
      data: { product: producto }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.obtenerProductos();
      }
    });
  }

descargarReporteProductos(): void {
  const estado = this.mostrarActivos ? 'A' : 'I';

  this.productService.downloadProductReportByStatus(estado).subscribe({
    next: (data: Blob) => {
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_productos_${estado === 'A' ? 'activos' : 'inactivos'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => {
      console.error('Error al descargar PDF:', err);
      Swal.fire('Error', 'No se pudo descargar el reporte.', 'error');
    }
  });
}


}
