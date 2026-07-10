import { ChildEntity, Column } from "typeorm";
import { Vehiqlo } from "./vehiqlo.entity";

export enum TipoMoto {
    SCOOTER = "Scooter",
    DEPORTIVA = "Deportiva",
    CUATRIMOTO = "Cuatrimoto",
}
@ChildEntity("Moto")
export class Moto extends Vehiqlo {
    @Column()
    cilindraje: number;
    @Column()
    tipo: TipoMoto;

    obtenerTipo(): string {
        return "Moto";
    }
}
