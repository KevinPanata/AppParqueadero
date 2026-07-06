export interface Espacio {
  id: string;
  nombre: string;
  descripcion?: string;
  tipo: string;
  estado: 'DISPONIBLE' | 'OCUPADO' | 'RESERVADO' | 'MANTENIMIENTO';
  activo: boolean;
  idZona: string;
  nombreZona: string;
}