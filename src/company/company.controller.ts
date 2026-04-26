import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'

import { CompanyService } from './company.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { Company } from './types/company.type'

@Controller('companies')
export class CompanyController {
  constructor(private readonly service: CompanyService) {}

  @Get()
  getAll(): Promise<Company[]> {
    return this.service.getAll()
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<Company> {
    return this.service.getById(id)
  }

  @Get('cnpj/:cnpj')
  getByCnpj(@Param('cnpj') cnpj: string): Promise<Company> {
    return this.service.getByCnpj(cnpj)
  }

  @Post()
  create(@Body() body: CreateCompanyDto): Promise<Company> {
    return this.service.create(body)
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<Company> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }

  @Patch(':id/activate')
  activate(@Param('id') id: string): Promise<Company> {
    return this.service.activate(id)
  }

  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string): Promise<Company> {
    return this.service.deactivate(id)
  }
}