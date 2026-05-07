import { Injectable } from '@nestjs/common'

import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

@Injectable()
export class CompanyResponsibleService {
  constructor(private repository: CompanyResponsibleRepository) {}

  async getAll(): Promise<CompanyResponsibleResponse[]> {
    return await this.repository.getAll()
  }

  async getByCpf(cpf: string): Promise<CompanyResponsibleResponse> {
    return await this.repository.getByCpf(cpf)
  }

  async getById(userId: string): Promise<CompanyResponsibleResponse> {
    return await this.repository.getById(userId)
  }

  async create(
    dto: CreateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    if (await this.repository.existsByCpf(dto.cpf))
      return this.getByCpf(dto.cpf)
    return await this.repository.create(dto)
  }

  async update(
    id: string,
    dto: UpdateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    await this.repository.update(id, dto)
    return this.repository.getById(id)
  }

  async delete(userId: string): Promise<{ message: string }> {
    return await this.repository.delete(userId)
  }
}
