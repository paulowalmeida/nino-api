import { Injectable } from '@nestjs/common'

import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsible } from './type/company-responsible.type'

@Injectable()
export class CompanyResponsibleService {
  constructor(private repository: CompanyResponsibleRepository) {}

  async getAll(): Promise<CompanyResponsible[]> {
    return await this.repository.getAll()
  }

  async getByCpf(cpf: string): Promise<CompanyResponsible> {
    return await this.repository.getByCpf(cpf)
  }

  async getById(userId: string): Promise<CompanyResponsible> {
    return await this.repository.getById(userId)
  }

  async create(dto: CreateCompanyResponsibleDto): Promise<CompanyResponsible> {
    return await this.repository.getByCpf(dto.cpf)
  }

  async update(
    userId: string,
    dto: UpdateCompanyResponsibleDto,
  ): Promise<CompanyResponsible> {
    return this.repository.update(userId, dto)
  }

  async delete(userId: string): Promise<{ message: string }> {
    return await this.repository.delete(userId)
  }
}
