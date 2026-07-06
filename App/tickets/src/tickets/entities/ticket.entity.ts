import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tickets')
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ length: 10 })
  placa!: string;

  @Column({ length: 10 })
  dni!: string;

  @Column({ type: 'uuid' })
  idEspacio!: string;

  @Column({ type: 'uuid' })
  idZona!: string;

  @Column()
  nombreZona!: string;

  @Column({ type: 'timestamp' })
  fechaHoraIngreso!: Date;

  @Column({ type: 'timestamp', nullable: true })
  fechaHoraSalida?: Date;

  @Column({ default: true })
  activo!: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  valorRecaudado?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}