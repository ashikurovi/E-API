import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { PromocodeService } from './promocode.service';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('promocode')
@UseGuards(CompanyIdGuard)
export class PromocodeController {
  constructor(private readonly promocodeService: PromocodeService) { }

  @Post()
  async create(@Body() dto: CreatePromocodeDto, @CompanyId() companyId: string) {
    const promo = await this.promocodeService.create(dto, companyId);
    return { statusCode: HttpStatus.CREATED, message: 'Promocode created', data: promo };
  }

  @Get()
  async findAll(@CompanyId() companyId: string) {
    const promos = await this.promocodeService.findAll(companyId);
    return { statusCode: HttpStatus.OK, data: promos };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const promo = await this.promocodeService.findOne(id, companyId);
    return { statusCode: HttpStatus.OK, data: promo };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePromocodeDto, @CompanyId() companyId: string) {
    const promo = await this.promocodeService.update(id, dto, companyId);
    return { statusCode: HttpStatus.OK, message: 'Promocode updated', data: promo };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    await this.promocodeService.remove(id, companyId);
    return { statusCode: HttpStatus.OK, message: 'Promocode soft deleted' };
  }

  @Patch(':id/toggle-active')
  async toggleActive(@Param('id', ParseIntPipe) id: number, @Query('active') active: string, @CompanyId() companyId: string) {
    const isActive = active === 'true';
    const promo = await this.promocodeService.toggleActive(id, isActive, companyId);
    return { statusCode: HttpStatus.OK, message: `Promocode ${isActive ? 'activated' : 'disabled'}`, data: promo };
  }
}
