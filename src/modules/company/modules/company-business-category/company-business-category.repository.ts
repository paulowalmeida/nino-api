import { Injectable, NotFoundException } from '@nestjs/common'

import { BusinessCategory, CompanyBusinessCategory } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

export type CompanyBusinessCategoryWithCategory = CompanyBusinessCategory & {
  businessCategory: BusinessCategory
}

@Injectable()
export class CompanyBusinessCategoryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getByCompanyId(
    companyId: string,
  ): Promise<CompanyBusinessCategoryWithCategory[]> {
    try {
      return await this.prisma.companyBusinessCategory.findMany({
        where: { companyId, deletedAt: null },
        include: { businessCategory: true },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    try {
      return await this.prisma.companyBusinessCategory.create({
        data: { companyId, businessCategoryId },
        include: { businessCategory: true },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(
    companyId: string,
    businessCategoryId: string,
  ): Promise<{ message: string }> {
    try {
      const found = await this.prisma.companyBusinessCategory.findFirst({
        where: { companyId, businessCategoryId, deletedAt: null },
      })
      if (!found)
        throw new NotFoundException('Company Business Category not found')
      await this.prisma.companyBusinessCategory.update({
        where: { businessCategoryId_companyId: { businessCategoryId, companyId } },
        data: { deletedAt: new Date() },
      })
      return { message: 'Company Business Category unlinked successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async activate(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    try {
      return await this.prisma.companyBusinessCategory.update({
        where: { businessCategoryId_companyId: { businessCategoryId, companyId } },
        data: { isActive: true },
        include: { businessCategory: true },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async deactivate(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    try {
      return await this.prisma.companyBusinessCategory.update({
        where: { businessCategoryId_companyId: { businessCategoryId, companyId } },
        data: { isActive: false },
        include: { businessCategory: true },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
