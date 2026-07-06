import {
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Clasificacion } from '../entities/vehiqlo.entity';
import { TipoMoto } from '../entities/moto.entity';

class BaseVehiculoDto {
  @IsString()
  @IsNotEmpty({ message: 'La placa no puede estar vacía' })
  @Matches(/^[A-Z]{3}-\d{4}$/, {
    message: 'La placa debe tener el formato ABC-1234',
  })
  placa!: string;

  @IsString()
  @IsNotEmpty({ message: 'La marca no puede estar vacía' })
  @MinLength(2, { message: 'La marca debe tener al menos 2 caracteres' })
  @MaxLength(30, { message: 'La marca debe tener máximo 30 caracteres' })
  @Matches(/^[A-Za-z áéíóúÁÉÍÓÚñÑ]+$/, {
    message: 'La marca solo puede contener letras y espacios',
  })
  marca!: string;

  @IsString()
  @IsNotEmpty({ message: 'El modelo no puede estar vacío' })
  @MinLength(1, { message: 'El modelo debe tener al menos 1 carácter' })
  @MaxLength(30, { message: 'El modelo debe tener máximo 30 caracteres' })
  @Matches(/^[A-Za-z0-9 áéíóúÁÉÍÓÚñÑ.-]+$/, {
    message: 'El modelo solo puede contener letras, números, espacios, puntos y guiones',
  })
  modelo!: string;

  @IsString()
  @IsNotEmpty({ message: 'El color no puede estar vacío' })
  @MinLength(3, { message: 'El color debe tener al menos 3 caracteres' })
  @MaxLength(20, { message: 'El color debe tener máximo 20 caracteres' })
  @Matches(/^[A-Za-z áéíóúÁÉÍÓÚñÑ]+$/, {
    message: 'El color solo puede contener letras y espacios',
  })
  color!: string;

  @IsNumber()
  @IsInt({ message: 'El año debe ser un número entero' })
  @Min(1900, { message: 'El año debe ser mayor o igual a 1900' })
  @Max(new Date().getFullYear() + 1, {
    message: 'El año no puede ser mayor al próximo año',
  })
  anio!: number;

  @IsEnum(Clasificacion, {
    message: `La clasificación debe ser una de las siguientes: ${Object.values(Clasificacion).join(', ')}`,
  })
  clasificacion!: Clasificacion;
}

class AutoDto extends BaseVehiculoDto {
  @IsNumber()
  @IsInt({ message: 'El número de puertas debe ser un número entero' })
  @Min(2, { message: 'El auto debe tener al menos 2 puertas' })
  @Max(5, { message: 'El auto no puede tener más de 5 puertas' })
  numPuertas!: number;

  @IsNumber()
  @Min(100, { message: 'La capacidad del maletero debe ser mayor a 100' })
  @Max(1000, { message: 'La capacidad del maletero debe ser menor a 1000' })
  capacidadMaletero!: number;
}

class MotoDto extends BaseVehiculoDto {
  @IsString()
  @IsNotEmpty({ message: 'La placa no puede estar vacía' })
  @Matches(/^[A-Z]{2}-\d{3}[A-Z]?$/, {
    message: 'La placa de moto debe tener el formato AB-123 o AB-123A',
  })
  declare placa: string;

  @IsNumber()
  @IsInt({ message: 'El cilindraje debe ser un número entero' })
  @Min(50, { message: 'El cilindraje debe ser mayor o igual a 50 cc' })
  @Max(2000, { message: 'El cilindraje debe ser menor o igual a 2000 cc' })
  cilindraje!: number;

  @IsEnum(TipoMoto, {
    message: `El tipo de moto debe ser uno de los siguientes: ${Object.values(TipoMoto).join(', ')}`,
  })
  tipoMoto!: TipoMoto;
}

class CamionetaDto extends BaseVehiculoDto {
  @IsString()
  @IsNotEmpty({ message: 'La cabina no puede estar vacía' })
  @MinLength(5, { message: 'La cabina debe tener al menos 5 caracteres' })
  @MaxLength(20, { message: 'La cabina debe tener máximo 20 caracteres' })
  @Matches(/^[A-Za-z áéíóúÁÉÍÓÚñÑ]+$/, {
    message: 'La cabina solo puede contener letras y espacios',
  })
  cabina!: string;

  @IsNumber()
  @IsInt({ message: 'La capacidad de carga debe ser un número entero' })
  @Min(100, { message: 'La capacidad de carga debe ser mayor a 100' })
  @Max(5000, { message: 'La capacidad de carga debe ser menor a 5000' })
  capacidadCarga!: number;
}

export class CreateVehiculoDto {
  @IsIn(['AUTO', 'MOTO', 'CAMIONETA'], {
    message: 'El tipo debe ser AUTO, MOTO o CAMIONETA',
  })
  tipo!: string;

  @ValidateNested()
  @Type((opts) => {
    const object = opts?.object as CreateVehiculoDto;

    switch (object?.tipo) {
      case 'AUTO':
        return AutoDto;
      case 'MOTO':
        return MotoDto;
      case 'CAMIONETA':
        return CamionetaDto;
      default:
        return BaseVehiculoDto;
    }
  })
  datos!: AutoDto | MotoDto | CamionetaDto;
}