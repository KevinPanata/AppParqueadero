import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiculoDto } from './create-vehiqlo.dto';

export class UpdateVehiculoDto extends PartialType(CreateVehiculoDto) {}
