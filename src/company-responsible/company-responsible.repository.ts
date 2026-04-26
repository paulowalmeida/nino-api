import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCompanyResponsibleDto } from './dto/create-company-responsible.dto'
import { UpdateCompanyResponsibleDto } from './dto/update-company-responsible.dto'
import { CompanyResponsible } from './type/company-responsible.type'

@Injectable()
export class CompanyResponsibleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getAll(): Promise<CompanyResponsible[]> {
    try {
      return await this.prisma.companyResponsible.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<CompanyResponsible> {
    try {
      const found = await this.prisma.companyResponsible.findUnique({
        where: { id },
      })

      if (!found) {
        throw new NotFoundException('Company responsible not found')
      }
      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getByCpf(cpf: string): Promise<CompanyResponsible> {
    try {
      const found = await this.prisma.companyResponsible.findUnique({
        where: { cpf },
      })

      if (!found) {
        throw new NotFoundException('Company responsible not found')
      }

      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async create(dto: CreateCompanyResponsibleDto): Promise<CompanyResponsible> {
    try {
      return await this.prisma.companyResponsible.create({
        data: { ...dto },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(
    id: string,
    dto: UpdateCompanyResponsibleDto,
  ): Promise<CompanyResponsible> {
    try {
      return await this.prisma.companyResponsible.update({
        where: { id },
        data: dto,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.companyResponsible.delete({
        where: { id },
      })

      return { message: 'Responsible was deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
