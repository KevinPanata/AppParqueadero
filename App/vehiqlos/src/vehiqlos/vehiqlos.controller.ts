import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { VehiculosService } from './vehiqlos.service';
import { CreateVehiculoDto } from './dto/create-vehiqlo.dto';
import { UpdateVehiculoDto } from './dto/update-vehiqlo.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';
import * as os from 'os';

interface JwtUserPayload {
  sub?: string;
  userId?: string;
  email?: string;
  dni?: string;
  roles?: string[];
}

interface AuthenticatedRequest extends Request {
  user?: JwtUserPayload;
  token?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/vehiculos')
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() createVehiculoDto: CreateVehiculoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.vehiculosService.create(
      createVehiculoDto,
      this.construirAuditContext(request),
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Req() request: AuthenticatedRequest) {
    return this.vehiculosService.findAll(this.construirAuditContext(request));
  }

  @Get('placa/:placa')
  @Roles(Role.ADMIN, Role.CLIENTE)
  findByPlaca(
    @Param('placa') placa: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.vehiculosService.findByPlaca(
      placa,
      this.construirAuditContext(request),
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.vehiculosService.findOne(
      id,
      this.construirAuditContext(request),
    );
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateVehiculoDto: UpdateVehiculoDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.vehiculosService.update(
      id,
      updateVehiculoDto,
      this.construirAuditContext(request),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.vehiculosService.remove(
      id,
      this.construirAuditContext(request),
    );
  }

  private obtenerIp(request: Request): string {
    const forwardedFor = request.headers['x-forwarded-for'];

    let ip = '';

    if (typeof forwardedFor === 'string' && forwardedFor.trim() !== '') {
      ip = forwardedFor.split(',')[0].trim();
    } else {
      ip = request.ip || request.socket.remoteAddress || '127.0.0.1';
    }

    ip = ip.replace('::ffff:', '');

    if (ip === '::1' || ip === '127.0.0.1' || ip === '0:0:0:0:0:0:0:1') {
      return this.obtenerIpv4Local();
    }

    return ip;
  }

  private obtenerIpv4Local(): string {
    const interfaces = os.networkInterfaces();

    for (const nombreInterfaz of Object.keys(interfaces)) {
      const datosInterfaz = interfaces[nombreInterfaz];

      if (!datosInterfaz) continue;

      for (const item of datosInterfaz) {
        if (
          item.family === 'IPv4' &&
          !item.internal &&
          item.address.startsWith('192.')
        ) {
          return item.address;
        }
      }
    }

    return '127.0.0.1';
  }

  private obtenerMac(request: Request): string {
    const macHeader = request.headers['x-client-mac'];

    if (typeof macHeader === 'string' && macHeader.trim() !== '') {
      return macHeader.trim();
    }

    const interfaces = os.networkInterfaces();

    for (const nombreInterfaz of Object.keys(interfaces)) {
      const datosInterfaz = interfaces[nombreInterfaz];

      if (!datosInterfaz) continue;

      for (const item of datosInterfaz) {
        if (item.mac && item.mac !== '00:00:00:00:00:00' && !item.internal) {
          return item.mac.toUpperCase();
        }
      }
    }

    return '00:00:00:00:00:00';
  }

  private construirAuditContext(request: AuthenticatedRequest) {
    const user = request.user;

    return {
      usuario: user?.sub,
      idPersona: user?.userId,
      ip: this.obtenerIp(request),
      mac: this.obtenerMac(request),
    };
  }
}
