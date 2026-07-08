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
import * as os from 'os';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

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
@Controller('api/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() createTicketDto: CreateTicketDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketsService.create(
      createTicketDto,
      request.token ?? '',
      this.construirAuditContext(request),
    );
  }

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Req() request: AuthenticatedRequest) {
    return this.ticketsService.findAll(this.construirAuditContext(request));
  }

  @Get('activos')
  @Roles(Role.ADMIN)
  findActivos(@Req() request: AuthenticatedRequest) {
    return this.ticketsService.findActivos(
      this.construirAuditContext(request),
    );
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.CLIENTE)
  findOne(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.ticketsService.findOne(
      id,
      this.construirAuditContext(request),
    );
  }

  @Patch(':id/cerrar')
  @Roles(Role.ADMIN)
  cerrarTicket(
    @Param('id') id: string,
    @Body() updateTicketDto: UpdateTicketDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.ticketsService.cerrarTicket(
      id,
      updateTicketDto,
      request.token ?? '',
      this.construirAuditContext(request),
    );
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Req() request: AuthenticatedRequest) {
    return this.ticketsService.remove(id, this.construirAuditContext(request));
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
      return macHeader.trim().toUpperCase();
    }

    const interfaces = os.networkInterfaces();

    for (const nombreInterfaz of Object.keys(interfaces)) {
      const datosInterfaz = interfaces[nombreInterfaz];

      if (!datosInterfaz) continue;

      for (const item of datosInterfaz) {
        if (
          item.mac &&
          item.mac !== '00:00:00:00:00:00' &&
          !item.internal
        ) {
          return item.mac.toUpperCase();
        }
      }
    }

    return '00:00:00:00:00:00';
  }
}