import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('evento_auditoria')
export class EventoAuditoria {
    @PrimaryGeneratedColumn('uuid')
    id!:string

    @Column({type: 'varchar', length: 50})
    servicio!:string

    @Column({type: 'varchar', length: 50})
    accion!:string

    @Column({type: 'varchar', length: 50})
    entidad!:string

    @Column({type: 'jsonb', nullable:true})
    datos!:any

    @Column({type: 'varchar', length: 100})
    usuario!:string

    @Column({type: 'varchar', length: 45})
    ip!:string

    @Column({type: 'varchar', length: 17})
    mac!:string

    @CreateDateColumn({ type: 'timestamp' })
    timestamp!: Date;
}
