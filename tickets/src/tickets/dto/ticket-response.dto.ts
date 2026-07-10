export class TicketResponseDto{
    id!:string;
    placa!:string;
    dni!:string;
    datosPeronsa?:string;
    fechaHoraIngreso!:Date;
    fechaHoraSalida!:Date;
    costo!:number;
    valorRecaudado!:number;
    activo!:boolean;
    createdAt!:Date;
    updatedAt!:Date;
    
}