import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { PaginationService } from '@shared/services/pagination/pagination.service'
import { ErrorService } from '@shared/services/error/error.service'
import { CompanyQueryDto } from './dto/company-query.dto'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { Company } from './entities/company.entity'
import { CompanyOrderBy } from './types/company-order-by.type'
import { CompanyPaginatedResponse } from './types/company-paginated-response.type'

@Injectable()
export class CompanyRepository {
  constructor(
    @InjectRepository(Company)
    private readonly repository: Repository<Company>,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAll(query: CompanyQueryDto): Promise<CompanyPaginatedResponse> {
    try {
      const [data, total] = await this.repository.findAndCount({
        order: { [query.orderBy ?? CompanyOrderBy.COMPANY_NAME]: query.orderDir ?? 'ASC' },
        ...this.paginationService.getPaginationParams(query),
      })
      return this.paginationService.paginate(data, total, query)
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
      await this.repository.softDelete(id)
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
