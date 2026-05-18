import { Injectable } from '@nestjs/common'

import { BaseService } from '@shared/services/base/base.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

@Injectable()
export class CompanyResponsibleService extends BaseService<
  CompanyResponsibleResponse,
  CreateCompanyResponsibleDto,
  UpdateCompanyResponsibleDto
> {
  constructor(private repo: CompanyResponsibleRepository) {
    super(repo)
  }

  async getByCpf(cpf: string): Promise<CompanyResponsibleResponse> {
    return this.repo.getByCpf(cpf)
  }

  async create(
    dto: CreateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    if (await this.repo.existsByCpf(dto.cpf))
      return this.getByCpf(dto.cpf)
    return this.repo.create(dto)
  }
}
