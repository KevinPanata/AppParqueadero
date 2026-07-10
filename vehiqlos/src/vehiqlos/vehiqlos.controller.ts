import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VehiqlosService } from './vehiqlos.service';
import { CreateVehiqloDto } from './dto/create-vehiqlo.dto';
import { UpdateVehiqloDto } from './dto/update-vehiqlo.dto';
import { Roles } from '../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('vehiqlos')
@UseGuards(JwtAuthGuard)
export class VehiqlosController {
  constructor(private readonly vehiqlosService: VehiqlosService) {}

  @Post()
  @Roles('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')
  create(@Body() createVehiqloDto: CreateVehiqloDto) {
    return this.vehiqlosService.create(createVehiqloDto);
  }

  @Get()
  @Roles('ADMINISTRADOR', 'ADMIN')
  findAll() {
    return this.vehiqlosService.findAll();
  }

  @Get(':id')
  @Roles('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')
  findOne(@Param('id') id: string) {
    return this.vehiqlosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')
  update(@Param('id') id: string, @Body() updateVehiqloDto: UpdateVehiqloDto) {
    return this.vehiqlosService.update(id, updateVehiqloDto);
  }

  @Delete(':id')
  @Roles('ADMINISTRADOR', 'ADMIN', 'CLIENTE', 'CLIENT')
  remove(@Param('id') id: string) {
    return this.vehiqlosService.remove(id);
  }
}
