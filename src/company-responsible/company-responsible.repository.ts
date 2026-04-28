import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CompanyResponsible } from '@company-responsible/entities/company-responsible.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'

@Injectable()
export class CompanyResponsibleRepository {
  constructor(
    @InjectRepository(CompanyResponsible)
    private readonly repository: Repository<CompanyResponsible>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<CompanyResponsible[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<CompanyResponsible> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Company responsible not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCpf(cpf: string): Promise<CompanyResponsible> {
    try {
      const found = await this.repository.findOneBy({ cpf })
      if (!found) throw new NotFoundException('Company responsible not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(dto: CreateCompanyResponsibleDto): Promise<CompanyResponsible> {
    try {
      const responsible = this.repository.create(dto)
      return await this.repository.save(responsible)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, dto: UpdateCompanyResponsibleDto): Promise<CompanyResponsible> {
    try {
      const responsible = await this.getById(id)
      Object.assign(responsible, dto)
      return await this.repository.save(responsible)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
      return { message: 'Responsible was deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
