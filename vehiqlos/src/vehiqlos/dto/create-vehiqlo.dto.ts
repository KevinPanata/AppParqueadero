import { IsBoolean, IsEnum, IsIn, IsInt, IsNotEmpty, IsNumber, IsString, Matches, Max, MaxLength, Min, MinLength, ValidateNested, registerDecorator, ValidationOptions, ValidationArguments } from "class-validator";
import { TipoMoto } from "../entities/moto.entity";
import { Clasificacion } from "../entities/vehiqlo.entity";
import { Type } from "class-transformer";

export function IsAnioValido(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAnioValido',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'number') return false;
          const anioActual = process.env.CURRENT_YEAR
            ? parseInt(process.env.CURRENT_YEAR, 10)
            : new Date().getFullYear();
          return value <= anioActual + 1;
        },
        defaultMessage(args: ValidationArguments) {
          const anioActual = process.env.CURRENT_YEAR
            ? parseInt(process.env.CURRENT_YEAR, 10)
            : new Date().getFullYear();
          return `El año no puede ser mayor a ${anioActual + 1} (Año actual + 1)`;
        }
      },
    });
  };
}

class BaseVehiqloDto {
    @IsString()
    @Matches(/^[A-Z]{3}-\d{4}$/,{message: 'La placa debe tener el formato ABC-1234' })
    placa!: string;

    @IsString()
    @IsNotEmpty({message: 'La marca no puede estar vacía'})
    @MinLength(3, { message: 'La marca debe tener al menos 3 caracteres' })
    @MaxLength(15, { message: 'La marca debe tener menos de 15 caracteres' })
    @Matches(/^[A-Za-z áéíóúÁÉÍÓÚñÑ]+$/, { message: 'La marca solo puede contener letras y espacios' })
    marca!: string;

    @IsString()
    @IsNotEmpty({message: 'El modelo no puede estar vacío'})
    @MinLength(3, { message: 'El modelo debe tener al menos 3 caracteres' })
    @MaxLength(20, { message: 'El modelo debe tener menos de 20 caracteres' })
    @Matches(/^[A-Za-z áéíóúÁÉÍÓÚñÑ]+$/, { message: 'El modelo solo puede contener letras, números y espacios' })
    modelo!: string;

    @IsString()
    @IsNotEmpty({message: 'El color no puede estar vacío'})
    @MinLength(3, { message: 'El color debe tener al menos 3 caracteres' })
    @MaxLength(15, { message: 'El color debe tener menos de 15 caracteres' })
    @Matches(/^[A-Za-z áéíóúÁÉÍÓÚñÑ]+$/, { message: 'El color solo puede contener letras y espacios' })
    color!: string;

    @IsNumber()
    @IsInt({message: 'El año debe ser un número entero'})
    @Min(1900, { message: 'El año debe ser mayor a 1900' })
    @IsAnioValido()
    anio!: number;

    @IsNotEmpty({message: 'La clasificación no puede estar vacía'})
    @IsEnum(Clasificacion, {message: `La clasificación debe ser una de las siguientes: ${Object.values(Clasificacion).join(', ')}`})
    clasificacion!: Clasificacion;
}

class AutoDto extends BaseVehiqloDto {
    @IsNumber()
    @Min(2, { message: 'El auto debe tener al menos 2 puertas' })
    @Max(5,{message: 'El auto debe tener menos de 5 puertas' })
    @IsInt({message: 'El número de puertas debe ser un número entero'})
    numPuertas!: number;

    @IsNumber()
    @Min(100, { message: 'La capacidad del maletero debe ser mayor a 100' })
    @Max(1000, { message: 'La capacidad del maletero debe ser menor a 1000' })
    capacidadMaletero!: number;
}

class MotoDto extends BaseVehiqloDto{

    @IsString()
    @IsNotEmpty({message: 'La placa no puede estar vacía'})
    @Matches(/^[A-Z]{2}-?\d{3}[A-Z]$/,{message: 'La placa debe tener el formato AB123A o AB-123A' })
    declare placa: string; 

    @IsNotEmpty({message: 'El tipo de moto no puede estar vacío'})
    @IsEnum(TipoMoto, {message: `El tipo de moto debe ser uno de los siguientes: ${Object.values(TipoMoto).join(', ')}`})
    tipo!: TipoMoto;

    @IsNumber()
    @IsInt({message: 'El cilindraje debe ser un número entero'})
    @Min(50, { message: 'El cilindraje debe ser mayor a 50' })
    cilindraje!: number;
}

class CamionetaDto extends BaseVehiqloDto{

    @IsString()
    @IsNotEmpty({message: 'La cabina no puede estar vacía'})
    @MinLength(5, { message: 'La cabina debe tener al menos 5 caracteres' })
    @MaxLength(20, { message: 'La cabina debe tener menos de 20 caracteres' })
    @Matches(/^[A-Za-z áéíóúÁÉÍÓÚñÑ]+$/, { message: 'La cabina solo puede contener letras y espacios' })
    cabina!: string;

    @IsNumber()
    @Min(100, { message: 'La capacidad de carga debe ser mayor a 100' })
    @Max(1000, { message: 'La capacidad de carga debe ser menor a 1000' })
    @IsInt({message: 'La capacidad de carga debe ser un número entero'})
    capacidadCarga!: number;

    
}

export class CreateVehiqloDto {
  @IsIn(['Auto', 'Moto', 'Camioneta'])
  tipo!: string;

  @ValidateNested()
  @Type((opts) => {
    const object = opts?.object as CreateVehiqloDto;
    if (!object) return BaseVehiqloDto;

    switch (object.tipo) {
      case 'Auto': return AutoDto;
      case 'Moto': return MotoDto;
      case 'Camioneta': return CamionetaDto;
      default: return BaseVehiqloDto;
    }
  })
  datos!: AutoDto | MotoDto | CamionetaDto;
}
