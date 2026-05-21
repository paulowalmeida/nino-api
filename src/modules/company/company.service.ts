import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CompanyRepository } from './company.repository'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyFull } from './types/company-full.type'
import { CompanyPaginatedResponse } from './types/company-paginated-response.type'
import { CompanyResponse } from './types/company-response.type'

@Injectable()
export class CompanyService {
  private readonly include = { responsible: true } as const

  constructor(private readonly repo: CompanyRepository) {}

  private toResponse(company: CompanyFull): CompanyResponse {
    const { ownerId: _, responsibleId: __, ...rest } = company
    return rest
  }

  async getAll(params?: PaginatedQueryDto): Promise<CompanyPaginatedResponse> {
    const result = await this.repo.findAllPaginated<CompanyFull>({
      page: params?.page,
      size: params?.size,
      order: {
        target: params?.target ?? 'name',
        direction: params?.direction ?? 'asc',
      },
      include: this.include,
    })
    return { ...result, data: result.data.map((c) => this.toResponse(c)) }
  }

  async getById(id: string): Promise<CompanyResponse> {
    const company = await this.repo.findItem<CompanyFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(company)
  }

  async getByField<V>(field: string, value: V): Promise<CompanyResponse> {
    const company = await this.repo.findItem<CompanyFull>({
      where: { [field]: value },
      include: this.include,
    })
    return this.toResponse(company)
  }

  async create(data: CreateCompanyDto): Promise<CompanyResponse> {
    const company = await this.repo.insert<CreateCompanyDto, CompanyFull>({
      data,
      include: this.include,
    })
    return this.toResponse(company)
  }

  async update(id: string, data: UpdateCompanyDto): Promise<CompanyResponse> {
    await this.repo.updateItem<UpdateCompanyDto, CompanyFull>({
      where: { id },
      data,
    })
    return this.getById(id)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }

  async setActive(id: string, isActive: boolean): Promise<CompanyResponse> {
    await this.repo.updateItem<{ isActive: boolean }, CompanyFull>({
      where: { id },
      data: { isActive },
    })
    return this.getById(id)
  }
}
