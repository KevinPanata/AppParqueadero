import { ChildEntity } from "typeorm";
import { Vehiqlo } from "./vehiqlo.entity";
import { Column } from "typeorm";

@ChildEntity('Auto')
export class Auto extends Vehiqlo {
    @Column()
    numPuertas: number;
    @Column()
    capacidadMaletero: number;
    obtenerTipo(): string {
        return "Auto";
    }
}
