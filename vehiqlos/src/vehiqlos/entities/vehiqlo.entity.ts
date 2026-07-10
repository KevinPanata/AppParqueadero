import { Column, Entity, PrimaryGeneratedColumn, TableInheritance } from "typeorm";

export enum Clasificacion {
    ELECTRICO = 'Eléctrico',
    HIBRIDO = 'Hibrido',
    GASOLINA = 'Gasolina',
    DIESEL = 'Diesel'
}
@Entity()
@TableInheritance({ column: { type: 'varchar', name: 'tipo' } })
export abstract class Vehiqlo {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    placa: string;

    @Column()
    marca: string;

    @Column()
    color: string;

    @Column()
    anio: number;

    @Column()
    clasificacion: string;

    abstract obtenerTipo(): string;
}
