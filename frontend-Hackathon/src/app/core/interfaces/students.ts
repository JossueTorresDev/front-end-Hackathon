export interface Students {
  idEstudiante: number;
  dni: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string; // formato ISO string (ej. "2000-01-01")
  correo: string;
  telefono: string;
  idUbigeo: number;
  idPrograma: number;
  estado: string; // 'A' o 'I'
  fechaRegistro: string;
}
