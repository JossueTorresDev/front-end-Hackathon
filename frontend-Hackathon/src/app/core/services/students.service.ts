import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Students } from '../interfaces/students'; // Asegúrate que esta interfaz esté bien definida

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = 'https://organic-zebra-jjrqgjq7pgg4cpq47-8085.app.github.dev/estudiantes';

  constructor(private http: HttpClient) {}

  /**
   * Lista todos los estudiantes
   */
  getAllStudents(): Observable<Students[]> {
    return this.http.get<Students[]>(`${this.apiUrl}`);
  }

  /**
   * Obtener estudiante por ID
   */
  getStudentById(id: number): Observable<Students> {
    return this.http.get<Students>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener estudiantes activos
   */
  getActiveStudents(): Observable<Students[]> {
    return this.http.get<Students[]>(`${this.apiUrl}/active`);
  }

  /**
   * Obtener estudiantes inactivos
   */
  getInactiveStudents(): Observable<Students[]> {
    return this.http.get<Students[]>(`${this.apiUrl}/inactive`);
  }

  /**
   * Crear un nuevo estudiante
   */
  createStudent(student: Students): Observable<Students> {
    return this.http.post<Students>(`${this.apiUrl}`, student, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Actualizar un estudiante existente
   */
  updateStudent(id: number, student: Students): Observable<Students> {
    return this.http.put<Students>(`${this.apiUrl}/${id}`, student, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Eliminar (lógicamente) un estudiante
   */
  deleteStudent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  /**
   * Restaurar un estudiante eliminado
   */
restoreStudent(id: number): Observable<void> {
  return this.http.put<void>(`${this.apiUrl}/restaurar/${id}`, {});
}

}
