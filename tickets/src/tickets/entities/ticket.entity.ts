import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'tickets'})
export class Ticket {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({name: 'placa', length: 15, nullable: false})
    placa!: string;

    @Column({name: 'dni', length: 20, nullable: false})
    dni!: string;

    @Column({name: 'id_espacio', nullable: false, type: 'uuid'})
    idEspacio!: string;

    @Column({name: 'nombre_zona', length: 100, nullable: false})
    nombreZona!: string;


    @Column({name: 'fecha_hora_ingreso', nullable: false, type: 'timestamp'})
    fechaHoraIngreso!: Date;

    @Column({name: 'fecha_hora_salida', nullable: true, type: 'timestamp'})
    fechaHoraSalida!: Date;

    @Column({name: 'costo', nullable: true})
    costo!: number;

    @Column({name: 'activo', nullable: false, default: true})
    activo!: boolean;

    @Column({name: 'valor_recaudado', nullable: false})
    valorRecaudado!: number;

    @Column({name: 'created_at', nullable: false, type: 'timestamp'})
    createdAt!: Date;

    @Column({name: 'updated_at', nullable: false, type: 'timestamp'})
    updatedAt!: Date;

    
}
