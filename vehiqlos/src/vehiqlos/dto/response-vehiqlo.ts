import { Clasificacion } from "../entities/vehiqlo.entity";
import { TipoMoto } from "../entities/moto.entity";

export class ResponseVehiculo{
    id: number;
    placa!: string;
    marca!: string;
    modelo!: string;
    anio!: number;
    color!: string;
    clasificacion!: Clasificacion;
    numeroPuertas!: number;
    capacidadMaletero!: number;
    cabina!: string;
    capacidadCarga!: number;
    tipo!: TipoMoto;
}