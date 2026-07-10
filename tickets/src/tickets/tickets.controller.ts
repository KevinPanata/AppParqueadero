import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Headers } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')
  create(@Body() createTicketDto: CreateTicketDto, @Headers('authorization') authHeader: string) {
    return this.ticketsService.create(createTicketDto, authHeader);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'ADMIN')
  findAll() {
    return this.ticketsService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')
  findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')
  update(@Param('id') id: string, @Body() updateTicketDto: UpdateTicketDto, @Headers('authorization') authHeader: string) {
    return this.ticketsService.cerrarTicket(id, updateTicketDto, authHeader);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'ADMIN')
  remove(@Param('id') id: string) {
    return this.ticketsService.remove(id);
  }
}