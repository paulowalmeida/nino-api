import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { Company } from './types/company.type'

@Injectable()
export class CompanyRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getAll(): Promise<Company[]> {
    try {
      return await this.prisma.company.findMany({
        orderBy: { companyName: 'asc' },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<Company> {
    try {
      const found = await this.getCompany('id', id)
      if (!found) throw new NotFoundException('Company not found')
      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getByCnpj(cnpj: string): Promise<Company> {
    try {
      const found = await this.getCompany('cnpj', cnpj)
      if (!found) throw new NotFoundException('Company not found')
      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
  
  async create(data: CreateCompanyDto): Promise<Company> {
    try {
      const exists = await this.prisma.company.findUnique({
        where: { cnpj: data.cnpj },
      })
      if (exists) throw new ConflictException('CNPJ already exists')

      return await this.prisma.company.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdateCompanyDto): Promise<Company> {
    try {
      if (data.cnpj) {
        const conflict = await this.prisma.company.findUnique({
          where: { cnpj: data.cnpj },
        })
        if (conflict && conflict.id !== id) {
          throw new ConflictException('CNPJ já cadastrado')
        }
      }

      return await this.prisma.company.update({ where: { id }, data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.company.delete({ where: { id } })
      return { message: 'Company deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async activate(id: string): Promise<Company> {
    try {
      return await this.prisma.company.update({
        data: {
          isActive: true,
        },
        where: { id },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async deactivate(id: string): Promise<Company> {
    try {
      return await this.prisma.company.update({
        data: {
          isActive: false,
        },
        where: { id },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  private async getCompany(param: 'id' | 'cnpj', value: string) {
    const where = param === 'id' ? { id: value } : { cnpj: value }
    return await this.prisma.company.findUnique({
      where,
    })
  }
}
