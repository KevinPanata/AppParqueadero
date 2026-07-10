import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketDto } from './create-ticket.dto';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class UpdateTicketDto extends PartialType(CreateTicketDto) {


    @IsBoolean()
    @IsOptional()
    activo!:boolean

    @IsNumber()
    @IsOptional()
    valorRecaudado?:number

    
}
