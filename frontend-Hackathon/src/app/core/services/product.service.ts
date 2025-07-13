import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';


@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private baseUrl = 'https://zany-engine-g4x7p47rvr45cwgqp-8080.app.github.dev';
  private apiUrl = `${this.baseUrl}/product`;



  constructor(private http: HttpClient) {}


  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}`);
  }


  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }


  getActiveProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/active`);
  }


  getInactiveProduct(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/inactive`);
  }


  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}`, product, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }


  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }


  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }


  restoreProduct(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/restore/${id}`, {});
  }

  /**
 * Descargar el reporte MaestroProductos filtrado por estado
 */
downloadProductReportByStatus(status: string): Observable<Blob> {
  return this.http.get(`${this.apiUrl.replace('/product', '')}/reporte/maestro-productos?status=${status}`, {
    responseType: 'blob'
  });
}

  
}
