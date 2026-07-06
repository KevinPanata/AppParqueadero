import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

export enum Clasificacion {
  ELECTRICO = 'ELECTRICO',
  HIBRIDO = 'HIBRIDO',
  GASOLINA = 'GASOLINA',
  DIESEL = 'DIESEL',
}

@Entity('vehiculos')
@TableInheritance({ column: { type: 'varchar', name: 'tipo_vehiculo' } })
export abstract class Vehiculo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 10 })
  placa!: string;

  @Column({ length: 30 })
  marca!: string;

  @Column({ length: 30 })
  modelo!: string;

  @Column({ length: 20 })
  color!: string;

  @Column()
  anio!: number;

  @Column({
    type: 'enum',
    enum: Clasificacion,
  })
  clasificacion!: Clasificacion;

  abstract obtenerTipo(): string;
}