import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiqlo.entity';

@ChildEntity('AUTO')
export class Auto extends Vehiculo {
  @Column({ nullable: true })
  numPuertas!: number;

  @Column({ nullable: true })
  capacidadMaletero!: number;

  obtenerTipo(): string {
    return 'AUTO';
  }
}