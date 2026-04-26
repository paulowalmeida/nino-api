import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
} from '@nestjs/common'

import { CreateCompanyResponsibleDto } from '@company-responsible/dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from '@company-responsible/dto/update-company-responsible.dto'
import { CompanyResponsibleService } from './company-responsible.service'

@Controller('company-responsibles')
export class CompanyResponsibleController {
  constructor(private service: CompanyResponsibleService) {}

  @Get()
  async getAll() {
    return this.service.getAll()
  }

  @Get('id/:id')
  async getById(@Param('userId') userId: string) {
    return this.service.getById(userId)
  }

  @Get('doc/:id')
  async getByCpf(@Param('userId') userId: string) {
    return this.service.getById(userId)
  }

  @Post()
  async create(@Body() dto: CreateCompanyResponsibleDto) {
    return this.service.create(dto)
  }

  @Put(':id')
  async update(
    @Param('userId') userId: string,
    @Body() dto: UpdateCompanyResponsibleDto,
  ) {
    return this.service.update(userId, dto)
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('userId') userId: string) {
    return this.service.delete(userId)
  }
}
