import { IsNumber, IsOptional, Min } from 'class-validator';

export class UpdateTicketDto {
  @IsNumber()
  @IsOptional()
  @Min(0, { message: 'El valor recaudado no puede ser negativo' })
  valorRecaudado?: number;
}