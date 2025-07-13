import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPurchase } from '../../core/interfaces/purchase'; // Asegúrate de que la ruta es correcta

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private apiUrl = 'https://zany-engine-g4x7p47rvr45cwgqp-8080.app.github.dev/purchases';

  constructor(private http: HttpClient) {}

  // ✅ Método para formatear fechas tipo LocalDate (yyyy-MM-dd)
  private formatDateForBackend(date: any): string {
    const d = (date instanceof Date) ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getAllPurchases(): Observable<IPurchase[]> {
    return this.http.get<IPurchase[]>(this.apiUrl);
  }

  getPurchaseById(id: number): Observable<IPurchase> {
    return this.http.get<IPurchase>(`${this.apiUrl}/${id}`);
  }

  createPurchase(purchase: IPurchase): Observable<IPurchase> {
    const purchaseToSend = {
      ...purchase,
      datePurchase: this.formatDateForBackend(purchase.datePurchase)
    };
    return this.http.post<IPurchase>(this.apiUrl, purchaseToSend, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  updatePurchase(id: number, purchase: IPurchase): Observable<IPurchase> {
    const purchaseToSend = {
      ...purchase,
      datePurchase: this.formatDateForBackend(purchase.datePurchase)
    };
    return this.http.put<IPurchase>(`${this.apiUrl}/${id}`, purchaseToSend, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  deletePurchase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  restorePurchase(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/restore/${id}`, null);
  }
  descargarCompraPDF(purchaseId: number): Observable<Blob> {
  const url = `https://zany-engine-g4x7p47rvr45cwgqp-8080.app.github.dev/reporte/compra/${purchaseId}`;
  return this.http.get(url, { responseType: 'blob' });
}

}
