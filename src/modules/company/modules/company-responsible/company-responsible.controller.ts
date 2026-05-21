import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CompanyResponsibleService } from './company-responsible.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsiblePaginatedResponse } from './types/company-responsible-with-companies-paginated.type'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

@Controller('company-responsibles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
export class CompanyResponsibleController {
  constructor(private service: CompanyResponsibleService) {}

  @Get()
  async getAll(
    @Query() query: PaginatedQueryDto,
  ): Promise<CompanyResponsiblePaginatedResponse> {
    return this.service.getAll(query)
  }

  @Get('id/:id')
  async getById(@Param('id') id: string): Promise<CompanyResponsibleResponse> {
    return this.service.getByField('id', id)
  }

  @Get('doc/:doc')
  async getByCpf(
    @Param('doc') doc: string,
  ): Promise<CompanyResponsibleResponse> {
    return this.service.getByField('cpf', doc)
  }

  @Post()
  async create(
    @Body() dto: CreateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    return this.service.create(dto)
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
