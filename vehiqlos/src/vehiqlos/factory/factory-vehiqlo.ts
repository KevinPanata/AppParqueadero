import { CreateVehiqloDto } from '../dto/create-vehiqlo.dto';
import { Auto } from '../entities/auto.entity';
import { Camioneta } from '../entities/camioneta.entity';
import { Moto } from '../entities/moto.entity';
import { Vehiqlo } from '../entities/vehiqlo.entity';

export class FactoryVehiqlo {
  static crear(dto: CreateVehiqloDto): Vehiqlo {
    switch (dto.tipo) {
      case 'Auto':
        const auto = new Auto();
        Object.assign(auto, dto.datos);
        return auto;
      case 'Moto':
        const moto = new Moto();
        Object.assign(moto, dto.datos);
        return moto;
      case 'Camioneta':
        const camion = new Camioneta();
        Object.assign(camion, dto.datos);
        return camion;
      default:
        throw new Error(`Tipo de vehículo no soportado: ${dto.tipo}`);
    }
  }
}