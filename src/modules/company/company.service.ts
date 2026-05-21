import { Injectable } from '@nestjs/common'

import { Company } from '@prisma/client'

import { CompanyRepository } from './company.repository'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyPaginatedResponse } from './types/company-paginated-response.type'

@Injectable()
export class CompanyService {
  constructor(private readonly repo: CompanyRepository) {}

  async getAll(params?: PaginatedQueryDto): Promise<CompanyPaginatedResponse> {
    return this.repo.findAllPaginated<Company>({
      page: params?.page,
      size: params?.size,
      order: {
        target: params?.target ?? 'name',
        direction: params?.direction ?? 'asc',
      },
    })
  }

  async getById(id: string): Promise<Company> {
    return this.repo.findItem<Company>({ where: { id } })
  }

  async getByField<V>(field: string, value: V): Promise<Company> {
    return this.repo.findItem<Company>({ where: { [field]: value } })
  }

  async create(data: CreateCompanyDto): Promise<Company> {
    return this.repo.insert<CreateCompanyDto, Company>({ data })
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    return this.repo.updateItem<UpdateCompanyDto, Company>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }

  async setActive(id: string, isActive: boolean): Promise<Company> {
    return this.repo.updateItem<{ isActive: boolean }, Company>({
      where: { id },
      data: { isActive },
    })
  }
}
