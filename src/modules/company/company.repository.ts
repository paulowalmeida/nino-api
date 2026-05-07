import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { Company } from '@prisma/client'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { ErrorService } from '@shared/services/error/error.service'
import {
  PaginationService,
} from '@shared/services/pagination/pagination.service'
import { CompanyQueryDto } from './dto/company-query.dto'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyCreateData } from './types/company-create-data.type'
import {
  CompanyPaginatedResponse,
} from './types/company-paginated-response.type'

@Injectable()
export class CompanyRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAll(query: CompanyQueryDto): Promise<CompanyPaginatedResponse> {
    try {
      const params = this.paginationService.getPaginationParams(query)
      const orderBy = query.orderBy ?? 'name'
      const orderDir = query.orderDir ?? 'ASC'
      const [data, total] = await Promise.all([
        this.prisma.company.findMany({
          where: { deletedAt: null },
          orderBy: { [orderBy]: orderDir.toLowerCase() },
          skip: params.skip,
          take: params.take,
        }),
        this.prisma.company.count({ where: { deletedAt: null } }),
      ])
      return this.paginationService.paginate(data, total, query)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<Company> {
    try {
      const found = await this.prisma.company.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Company not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCnpj(cnpj: string): Promise<Company> {
    try {
      const found = await this.prisma.company.findFirst({
        where: { cnpj, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Company not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(dto: CreateCompanyDto): Promise<Company> {
    try {
      const exists = await this.prisma.company.findFirst({
        where: { cnpj: dto.cnpj, deletedAt: null },
      })
      if (exists) throw new ConflictException('CNPJ already exists')
      return await this.prisma.company.create({ data: dto })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, dto: UpdateCompanyDto): Promise<Company> {
    try {
      const company = await this.getById(id)
      if (dto.cnpj && dto.cnpj !== company.cnpj) {
        const exists = await this.prisma.company.findFirst({
          where: { cnpj: dto.cnpj, deletedAt: null },
        })
        if (exists) throw new ConflictException('CNPJ already exists')
      }
      return await this.prisma.company.update({ where: { id }, data: dto })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.company.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Company deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async activate(id: string): Promise<Company> {
    try {
      await this.getById(id)
      return await this.prisma.company.update({
        where: { id },
        data: { isActive: true },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async deactivate(id: string): Promise<Company> {
    try {
      await this.getById(id)
      return await this.prisma.company.update({
        where: { id },
        data: { isActive: false },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
