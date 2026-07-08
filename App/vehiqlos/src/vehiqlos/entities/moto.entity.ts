import { ChildEntity, Column } from 'typeorm';
import { Vehiculo } from './vehiqlo.entity';

export enum TipoMoto {
  SCOOTER = 'SCOOTER',
  DEPORTIVA = 'DEPORTIVA',
  CUATRIMOTO = 'CUATRIMOTO',
}

@ChildEntity('MOTO')
export class Moto extends Vehiculo {
  @Column({ nullable: true })
  cilindraje!: number;

  @Column({
    type: 'enum',
    enum: TipoMoto,
    nullable: true,
  })
  tipoMoto!: TipoMoto;

  obtenerTipo(): string {
    return 'MOTO';
  }
}
