import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ISale } from '../../core/interfaces/sale'; // Asegúrate que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  private apiUrl = 'https://zany-engine-g4x7p47rvr45cwgqp-8080.app.github.dev/api/sales';

  constructor(private http: HttpClient) { }

  private formatDateForBackend(date: any): string {
  const d = (date instanceof Date) ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


  getAllSales(): Observable<ISale[]> {
    return this.http.get<ISale[]>(this.apiUrl);
  }

  getSaleById(id: number): Observable<ISale> {
    return this.http.get<ISale>(`${this.apiUrl}/${id}`);
  }

  createSale(sale: ISale): Observable<ISale> {
    const saleToSend = {
      ...sale,
      dateSale: this.formatDateForBackend(sale.dateSale)
    };
    return this.http.post<ISale>(this.apiUrl, saleToSend, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  updateSale(id: number, sale: ISale): Observable<ISale> {
    const saleToSend = {
      ...sale,
      dateSale: this.formatDateForBackend(sale.dateSale)
    };
    return this.http.put<ISale>(`${this.apiUrl}/${id}`, saleToSend, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  deleteSale(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  restoreSale(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/restore/${id}`, null);
  }
    descargarBoletaPDF(saleId: number): Observable<Blob> {
    const url = `https://zany-engine-g4x7p47rvr45cwgqp-8080.app.github.dev/reporte/boleta/${saleId}`;
    return this.http.get(url, {
      responseType: 'blob' 
    });
  }

}
