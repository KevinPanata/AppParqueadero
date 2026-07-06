import { CreateVehiculoDto } from '../dto/create-vehiqlo.dto';
import { Auto } from '../entities/auto.entity';
import { Camioneta } from '../entities/camioneta.entity';
import { Moto } from '../entities/moto.entity';
import { Vehiculo } from '../entities/vehiqlo.entity';

export class FactoryVehiculo {
  static crear(dto: CreateVehiculoDto): Vehiculo {
    switch (dto.tipo) {
      case 'AUTO': {
        const auto = new Auto();
        Object.assign(auto, dto.datos);
        return auto;
      }

      case 'MOTO': {
        const moto = new Moto();
        Object.assign(moto, dto.datos);
        return moto;
      }

      case 'CAMIONETA': {
        const camioneta = new Camioneta();
        Object.assign(camioneta, dto.datos);
        return camioneta;
      }

      default:
        throw new Error(`Tipo de vehículo no soportado: ${dto.tipo}`);
    }
  }
}