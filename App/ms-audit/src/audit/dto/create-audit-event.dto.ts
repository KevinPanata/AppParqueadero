import { IsNotEmpty, IsObject, IsOptional, IsString, Matches, MaxLength, MinLength, IsIP, IsMACAddress, IsUUID } from 'class-validator';

export class CreateAuditEventDto {

    @IsString()
    @IsNotEmpty()
    @MinLength(7)
    @MaxLength(50)
    @Matches(/^ms-[a-zA-Z]+$/, { message: 'El servicio debe comenzar con "ms-" y contener solo letras.' })
    servicio!: string; //ms-users, ms-auth, ms-products, etc.

    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(10)
    @Matches(/^(CREATE|UPDATE|DELETE|LOGIN|LOGOUT|SELECT)$/, { message: 'La acción debe ser CREATE, UPDATE, DELETE, LOGIN, LOGOUT o SELECT.' })
    accion!: string; //CREATE, UPDATE, DELETE, LOGIN, LOGOUT, SELECT.

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(15)
    @Matches(/^[A-Z-]+$/, { message: 'La entidad debe contener solo letras mayúsculas y guiones medios.' })    
    entidad!: string;

    @IsObject()
    @IsOptional()
    datos!: Record<string, any>; 

    @IsString()
    @IsOptional()
    @MinLength(5) //ejemplo: "john.doe"
    @MaxLength(25)
    @Matches(/^[a-zA-Z0-9._-]+$/, { message: 'El usuario debe contener solo letras, números, puntos, guiones bajos y guiones medios.' })
    usuario?: string;

    @IsUUID('4', {
        message: 'El idPersona debe ser un UUID válido.',
    })
    @IsOptional()
    idPersona?: string;    

    @IsIP('4', { message: 'La dirección IP debe ser una dirección IPv4 válida.' })
    @IsNotEmpty()
    ip!: string;

    @IsMACAddress({ message: 'La dirección MAC debe ser una dirección MAC válida.' })
    @IsNotEmpty()
    mac!: string;

}
