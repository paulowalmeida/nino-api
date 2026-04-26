import { Injectable } from '@nestjs/common'

import { CompanyRepository } from './company.repository'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { Company } from './types/company.type'

@Injectable()
export class CompanyService {
  constructor(private readonly repo: CompanyRepository) {}

  async getAll(): Promise<Company[]> {
    return await this.repo.getAll()
  }

  async getById(id: string): Promise<Company> {
    return await this.repo.getById(id)
  }

  async getByCnpj(cnpj: string): Promise<Company> {
    return await this.repo.getByCnpj(cnpj)
  }

  async create(data: CreateCompanyDto): Promise<Company> {
    return await this.repo.create(data)
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    return await this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return await this.repo.delete(id)
  }

  async activate(id: string): Promise<Company> {
    return await this.repo.activate(id)
  }

  async deactivate(id: string): Promise<Company> {
    return await this.repo.deactivate(id)
  }
}