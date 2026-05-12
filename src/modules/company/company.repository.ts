import { Injectable } from '@nestjs/common'

import { Company, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CompanyQueryDto } from './dto/company-query.dto'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyPaginatedResponse } from './types/company-paginated-response.type'

@Injectable()
export class CompanyRepository
  extends BaseRepository<Prisma.CompanyDelegate> {
  constructor(
    prisma: PrismaService,
    errorService: ErrorService,
    paginationService: PaginationService,
  ) {
    super(errorService, prisma.company, 'Company', paginationService)
  }

  async getAll(query: CompanyQueryDto): Promise<CompanyPaginatedResponse> {
    return this.findAllPaginated<Company>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      orderBy: { [query.orderBy ?? 'name']: 'asc' },
    })
  }

  async getById(id: string): Promise<Company> {
    return this.findItem<Company>({ where: { id } })
  }

  async getByCnpj(cnpj: string): Promise<Company> {
    return this.findItem<Company>({ where: { cnpj } })
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    return this.insert<CreateCompanyDto, Company>({ data: dto })
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    return this.updateItem<UpdateCompanyDto, Company>({
      where: { id },
      data: dto,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }

  async activate(id: string): Promise<Company> {
    return this.updateItem<{ isActive: boolean }, Company>({
      where: { id },
      data: { isActive: true },
    })
  }

  async deactivate(id: string): Promise<Company> {
    return this.updateItem<{ isActive: boolean }, Company>({
      where: { id },
      data: { isActive: false },
    })
  }

}
