import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsibleWithCompanies } from './types/company-responsible-with-companies.type'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

@Injectable()
export class CompanyResponsibleRepository
  extends BaseRepository<Prisma.CompanyResponsibleDelegate>
  implements IBaseLookupRepository<
    CompanyResponsibleResponse,
    CreateCompanyResponsibleDto,
    UpdateCompanyResponsibleDto
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.companyResponsible, 'Company Responsible')
  }

  async getAll(): Promise<CompanyResponsibleResponse[]> {
    const items = await this.findAll<CompanyResponsibleWithCompanies>({
      orderBy: { name: 'asc' },
      include: { companies: true },
    })
    return items.map((i) => this.toResponse(i))
  }

  async getById(id: string): Promise<CompanyResponsibleResponse> {
    const found = await this.findItem<CompanyResponsibleWithCompanies>({
      where: { id },
      include: { companies: true },
    })
    return this.toResponse(found)
  }

  async getByCpf(cpf: string): Promise<CompanyResponsibleResponse> {
    const found = await this.findItem<CompanyResponsibleWithCompanies>({
      where: { cpf },
      include: { companies: true },
    })
    return this.toResponse(found)
  }

  async existsByCpf(cpf: string): Promise<boolean> {
    return this.exists({ where: { cpf } })
  }

  async create(
    dto: CreateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    const saved = await this.insert<
      CreateCompanyResponsibleDto,
      CompanyResponsibleWithCompanies
    >({
      data: dto,
      include: { companies: true },
    })
    return this.toResponse(saved)
  }

  async update(
    id: string,
    dto: UpdateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    const updated = await this.updateItem<
      UpdateCompanyResponsibleDto,
      CompanyResponsibleWithCompanies
    >({
      where: { id },
      data: dto,
      include: { companies: true },
    })
    return this.toResponse(updated)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }

  private toResponse(
    item: CompanyResponsibleWithCompanies,
  ): CompanyResponsibleResponse {
    const { deletedAt: _, ...rest } = item
    return rest
  }
}
