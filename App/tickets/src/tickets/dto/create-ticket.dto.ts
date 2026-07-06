import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty({ message: 'La placa es obligatoria' })
  @Matches(/^[A-Z]{2,3}-\d{3,4}[A-Z]?$/, {
    message: 'La placa debe tener un formato válido',
  })
  placa!: string;

  @IsString()
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @Matches(/^[0-9]{10}$/, {
    message: 'El DNI debe tener exactamente 10 dígitos',
  })
  dni!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID del espacio es obligatorio' })
  idEspacio!: string;

  @IsUUID()
  @IsNotEmpty({ message: 'El ID de la zona es obligatorio' })
  idZona!: string;
}