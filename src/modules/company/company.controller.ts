import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Company } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CompanyService } from './company.service'
import { CompanyQueryDto } from './dto/company-query.dto'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import {
  CompanyPaginatedResponse,
} from './types/company-paginated-response.type'

@Controller('companies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  getAll(@Query() query: CompanyQueryDto): Promise<CompanyPaginatedResponse> {
    return this.service.getAll(query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  getById(@Param('id') id: string): Promise<Company> {
    return this.service.getById(id)
  }

  @Get('cnpj/:cnpj')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  getByCnpj(@Param('cnpj') cnpj: string): Promise<Company> {
    return this.service.getByCnpj(cnpj)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  create(@Body() body: CreateCompanyDto): Promise<Company> {
    return this.service.create(body)
  }

  @Put(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  update(
    @Param('id') id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<Company> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }

  @Patch(':id/activate')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  activate(@Param('id') id: string): Promise<Company> {
    return this.service.activate(id)
  }

  @Patch(':id/deactivate')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  deactivate(@Param('id') id: string): Promise<Company> {
    return this.service.deactivate(id)
  }
}
