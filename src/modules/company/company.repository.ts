import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { Company } from './entities/company.entity'

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<Company[]> {
    try {
      return await this.repository.find({ order: { companyName: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<Company> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Company not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCnpj(cnpj: string): Promise<Company> {
    try {
      const found = await this.repository.findOneBy({ cnpj })
      if (!found) throw new NotFoundException('Company not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateCompanyDto): Promise<Company> {
    try {
      const exists = await this.repository.findOneBy({ cnpj: data.cnpj })
      if (exists) throw new ConflictException('CNPJ already exists')

      const company = this.repository.create(data)
      return await this.repository.save(company)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    try {
      const company = await this.getById(id)

      if (data.cnpj && data.cnpj !== company.cnpj) {
        const exists = await this.repository.findOneBy({ cnpj: data.cnpj })
        if (exists) throw new ConflictException('CNPJ already exists')
      }

      Object.assign(company, data)
      return await this.repository.save(company)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
      return { message: 'Company deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async activate(id: string): Promise<Company> {
    try {
      const company = await this.getById(id)
      company.isActive = true
      return await this.repository.save(company)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async deactivate(id: string): Promise<Company> {
    try {
      const company = await this.getById(id)
      company.isActive = false
      return await this.repository.save(company)
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
