import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CompanyResponsibleService } from './company-responsible.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'

@Controller('company-responsibles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.SUPPORT)
export class CompanyResponsibleController {
  constructor(private service: CompanyResponsibleService) {}

  @Get()
  async getAll() {
    return this.service.getAll()
  }

  @Get('id/:id')
  async getById(@Param('id') id: string) {
    return this.service.getById(id)
  }

  @Get('doc/:doc')
  async getByCpf(@Param('doc') doc: string) {
    return this.service.getByCpf(doc)
  }

  @Post()
  async create(@Body() dto: CreateCompanyResponsibleDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyResponsibleDto,
  ) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string) {
    return this.service.delete(id)
  }
}
