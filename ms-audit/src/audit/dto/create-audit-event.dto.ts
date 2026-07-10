import { IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsObject, IsOptional, IsIP, IsMACAddress } from "class-validator";


export class CreateAuditEventDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(50)
    @Matches(/^(ms-[a-zA-Z-]+)$/, {
        message: 'El servicio debe comenzar con "ms-" seguido de letras o guiones.', 
    })
    servicio!: string; //ej. "ms-auth", "ms-products", etc.
    
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(10)
    @Matches(/^(CREATE|UPDATE|DELETE|LOGIN|LOGOUT|SELECT)$/, {
        message: 'La accion debe ser una de las siguientes: CREATE, UPDATE, DELETE, LOGIN, LOGOUT, SELECT.',
    })
    action!: string; //ej. "create", "update", "delete", "read", etc.

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    @Matches(/^[A-Z_-]+$/, {
        message: 'La entidad solo puede contener letras mayusculas, guiones bajos y guiones medios.',
    })
    entidad!: string; //ej. "users", "products", "orders", etc.

    @IsObject()
    @IsOptional()
    datos?: Record<string, any>; //ej. {"id": 1, "name": "Jhon Doe"}


    @IsString()
    @IsOptional()
    @MinLength(3) //ejemplo:"root", "jhon.doe"
    @MaxLength(100)
    @Matches(/^[a-zA-Z0-9._@-]+$/,{
        message: 'El nombre del usuario solo puede contener letras, numeros, puntos, guiones bajos, guiones medios y arroba (@).',
    })
    usuario?: string;

    @IsIP('4', {message: 'La direccion IP debe ser un dirección IPv4 valida.'})
    @IsNotEmpty()
    ip!: string;

    @IsMACAddress({
        message: 'La direccion MAC debe ser una direccion MAC valida.',
    })
    @IsNotEmpty()
    mac!: string;

}