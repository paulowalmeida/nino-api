import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsiblePaginatedResponse } from './types/company-responsible-with-companies-paginated.type'
import { CompanyResponsibleWithCompanies } from './types/company-responsible-with-companies.type'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

@Injectable()
export class CompanyResponsibleService {
  private readonly include = { companies: true }

  constructor(private readonly repo: CompanyResponsibleRepository) {}

  private toResponse(
    item: CompanyResponsibleWithCompanies,
  ): CompanyResponsibleResponse {
    const { deletedAt: _, ...rest } = item
    return rest
  }

  async getAll(
    query: PaginatedQueryDto,
  ): Promise<CompanyResponsiblePaginatedResponse> {
    const result =
      await this.repo.findAllPaginated<CompanyResponsibleWithCompanies>({
        page: query.page,
        size: query.size,
        order: {
          target: query.target ?? 'name',
          direction: query.direction ?? 'asc',
        },
        include: this.include,
      })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async getByField(
    field: string,
    value: string,
  ): Promise<CompanyResponsibleResponse> {
    const found = await this.repo.findItem<CompanyResponsibleWithCompanies>({
      where: { [field]: value },
      include: this.include,
    })
    return this.toResponse(found)
  }

  async create(
    dto: CreateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    const exists = await this.repo.exists({ where: { cpf: dto.cpf } })
    if (exists) return this.getByField('cpf', dto.cpf)
    const saved = await this.repo.insert<
      CreateCompanyResponsibleDto,
      CompanyResponsibleWithCompanies
    >({ data: dto, include: this.include })
    return this.toResponse(saved)
  }

  async update(
    id: string,
    dto: UpdateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    const updated = await this.repo.updateItem<
      UpdateCompanyResponsibleDto,
      CompanyResponsibleWithCompanies
    >({ where: { id }, data: dto, include: this.include })
    return this.toResponse(updated)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
