import { PartialType } from '@nestjs/mapped-types';
import { CreateVehiqloDto } from './create-vehiqlo.dto';

export class UpdateVehiqloDto extends PartialType(CreateVehiqloDto) {}
