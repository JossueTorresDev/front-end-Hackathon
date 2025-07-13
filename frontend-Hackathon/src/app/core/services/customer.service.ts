import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Customer } from '../interfaces/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private baseUrl = 'https://zany-engine-g4x7p47rvr45cwgqp-8080.app.github.dev';
  private apiUrl = `${this.baseUrl}/customers`;

  constructor(private http: HttpClient) {}

  /**
   * Lista todos los clientes
   */
  getAllCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}`);
  }

  /**
   * Obtener cliente por ID
   */
  getCustomerById(id: number): Observable<Customer> {
    return this.http.get<Customer>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener clientes activos
   */
  getActiveCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/active`);
  }

  /**
   * Obtener clientes inactivos
   */
  getInactiveCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${this.apiUrl}/inactive`);
  }

  /**
   * Crear un nuevo cliente
   */
  createCustomer(customer: Customer): Observable<Customer> {
    return this.http.post<Customer>(`${this.apiUrl}`, customer, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  /**
   * Actualizar un cliente existente
   */
  updateCustomer(id: number, customer: Customer): Observable<Customer> {
    return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  /**
   * Eliminar (lógicamente) un cliente
   */
  deleteCustomer(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Restaurar un cliente eliminado
   */
  restoreCustomer(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/restore/${id}`, {});
  }

  /**
 * Descargar el reporte MaestroClientes filtrado por estado
 */
downloadCustomerReportByStatus(status: string): Observable<Blob> {
  return this.http.get(`${this.baseUrl}/reporte/maestro-clientes?status=${status}`, {
    responseType: 'blob'
  });
}

}