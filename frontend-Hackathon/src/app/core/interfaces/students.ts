export interface Students {
  idEstudiante?: number;
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;      // yyyy-MM-dd
  correo: string;
  telefono: string;
  programa: { idPrograma: number }; // ⬅️ Cambiado
  ubigeo: { idUbigeo: number };     // ⬅️ Cambiado
  estado?: string;              // 'A' o 'I'
  fechaRegistro?: string;       // generado automáticamente
}
