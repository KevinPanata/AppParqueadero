import { Clasificacion } from '../entities/vehiqlo.entity';
import { TipoMoto } from '../entities/moto.entity';

export class ResponseVehiculo {
  id!: string;
  placa!: string;
  marca!: string;
  modelo!: string;
  anio!: number;
  color!: string;
  clasificacion!: Clasificacion;
  tipoVehiculo!: string;

  numPuertas?: number;
  capacidadMaletero?: number;

  cabina?: string;
  capacidadCarga?: number;

  cilindraje?: number;
  tipoMoto?: TipoMoto;
}
