import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiqlo.entity';

@ChildEntity('CAMIONETA')
export class Camioneta extends Vehiculo {
  @Column({ nullable: true, length: 20 })
  cabina!: string;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  capacidadCarga!: number;

  obtenerTipo(): string {
    return 'CAMIONETA';
  }
}
