import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsible } from './entities/company-responsible.entity'
import { CompanyResponsibleResponse } from './types/company-responsible.type'

@Injectable()
export class CompanyResponsibleRepository {
  constructor(
    @InjectRepository(CompanyResponsible)
    private readonly repository: Repository<CompanyResponsible>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<CompanyResponsibleResponse[]> {
    try {
      const items = await this.repository.find({
        order: { name: 'ASC' },
        relations: ['company'],
      })
      return items.map(({ companyId: _, ...rest }) => rest)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<CompanyResponsibleResponse> {
    try {
      const found = await this.repository.findOne({
        where: { id },
        relations: ['company'],
      })
      if (!found) throw new NotFoundException('Company responsible not found')
      const { companyId: _, ...rest } = found
      return rest
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCpf(cpf: string): Promise<CompanyResponsibleResponse> {
    try {
      const found = await this.repository.findOne({
        where: { cpf },
        relations: ['company'],
      })
      if (!found) throw new NotFoundException('Company responsible not found')
      const { companyId: _, ...rest } = found
      return rest
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(dto: CreateCompanyResponsibleDto): Promise<CompanyResponsibleResponse> {
    try {
      await this.repository.save(this.repository.create(dto))
      const found = await this.repository.findOne({
        where: { companyId: dto.companyId },
        relations: ['company'],
      })
      if (!found) throw new NotFoundException('Company responsible not found')
      const { companyId: _, ...rest } = found
      return rest
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, dto: UpdateCompanyResponsibleDto): Promise<void> {
    try {
      const responsible = await this.repository.findOne({ where: { id } })
      if (!responsible) throw new NotFoundException('Company responsible not found')
      Object.assign(responsible, dto)
      await this.repository.save(responsible)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.softDelete(id)
      return { message: 'Responsible was deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
