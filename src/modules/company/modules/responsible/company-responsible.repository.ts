import { Injectable, NotFoundException } from '@nestjs/common'

import { CompanyResponsible, Company } from '@prisma/client'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { ErrorService } from '@shared/services/error/error.service'
import {
  CreateCompanyResponsibleDto,
} from './dto/create-company-responsible.dto'
import {
  UpdateCompanyResponsibleDto,
} from './dto/update-company-responsible.dto'
import {
  CompanyResponsibleResponse,
} from './types/company-responsible.type'

@Injectable()
export class CompanyResponsibleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  private toResponse(
    item: CompanyResponsible & { companies: Company[] },
  ): CompanyResponsibleResponse {
    const { deletedAt: _, ...rest } = item
    return rest
  }

  async getAll(): Promise<CompanyResponsibleResponse[]> {
    try {
      const items = await this.prisma.companyResponsible.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
        include: { companies: true },
      })
      return items.map((i) => this.toResponse(i))
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<CompanyResponsibleResponse> {
    try {
      const found = await this.prisma.companyResponsible.findFirst({
        where: { id, deletedAt: null },
        include: { companies: true },
      })
      if (!found)
        throw new NotFoundException('Company responsible not found')
      return this.toResponse(found)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCpf(cpf: string): Promise<CompanyResponsibleResponse> {
    try {
      const found = await this.prisma.companyResponsible.findFirst({
        where: { cpf, deletedAt: null },
        include: { companies: true },
      })
      if (!found)
        throw new NotFoundException('Company responsible not found')
      return this.toResponse(found)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async existsByCpf(cpf: string): Promise<boolean> {
    try {
      const found = await this.prisma.companyResponsible.findFirst({
        where: { cpf, deletedAt: null },
      })
      return !!found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(
    dto: CreateCompanyResponsibleDto,
  ): Promise<CompanyResponsibleResponse> {
    try {
      const saved = await this.prisma.companyResponsible.create({
        data: dto,
        include: { companies: true },
      })
      return this.toResponse(saved)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    dto: UpdateCompanyResponsibleDto,
  ): Promise<void> {
    try {
      const found = await this.prisma.companyResponsible.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found)
        throw new NotFoundException('Company responsible not found')
      await this.prisma.companyResponsible.update({
        where: { id },
        data: dto,
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.companyResponsible.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Responsible was deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
