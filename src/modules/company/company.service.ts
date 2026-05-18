import { Injectable } from '@nestjs/common'

import { Company } from '@prisma/client'

import { BaseService } from '@shared/services/base/base.service'
import { CompanyRepository } from './company.repository'
import { CompanyQueryDto } from './dto/company-query.dto'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyPaginatedResponse } from './types/company-paginated-response.type'

@Injectable()
export class CompanyService extends BaseService<
  Company,
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyQueryDto,
  CompanyPaginatedResponse
> {
  constructor(private repo: CompanyRepository) {
    super(repo)
  }

  async getByCnpj(cnpj: string): Promise<Company> {
    return this.repo.getByCnpj(cnpj)
  }

  async activate(id: string): Promise<Company> {
    return this.repo.activate(id)
  }

  async deactivate(id: string): Promise<Company> {
    return this.repo.deactivate(id)
  }
}
