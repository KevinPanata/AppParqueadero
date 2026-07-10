import { ChildEntity } from "typeorm";
import { Vehiqlo } from "./vehiqlo.entity";
import { Column } from "typeorm";

@ChildEntity('Camioneta')
export class Camioneta extends Vehiqlo {
    @Column()
    cabina: string;

    @Column('decimal', { precision: 10, scale: 2 })
    capacidadCarga: number;

    obtenerTipo(): string {
        return "Camioneta";
    }
}
