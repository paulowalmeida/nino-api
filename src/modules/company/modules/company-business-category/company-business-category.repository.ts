import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateCompanyBusinessCategoryDto } from './dtos/create-company-business-category.dto'
import { CompanyBusinessCategoryWithCategory } from './types/company-business-category-with-category.type'

@Injectable()
export class CompanyBusinessCategoryRepository
  extends BaseRepository<Prisma.CompanyBusinessCategoryDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.companyBusinessCategory, 'Company Business Category')
  }

  async getByCompanyId(
    companyId: string,
  ): Promise<CompanyBusinessCategoryWithCategory[]> {
    return this.findAll<CompanyBusinessCategoryWithCategory>({
      where: { companyId },
      include: { businessCategory: true },
    })
  }

  async create(
    companyId: string,
    dto: CreateCompanyBusinessCategoryDto,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.insert<
      CreateCompanyBusinessCategoryDto & { companyId: string },
      CompanyBusinessCategoryWithCategory
    >({
      data: { ...dto, companyId },
      include: { businessCategory: true },
    })
  }

  async delete(
    companyId: string,
    businessCategoryId: string,
  ): Promise<{ message: string }> {
    await this.updateItem<{ deletedAt: Date }, void>({
      where: {
        businessCategoryId_companyId: { businessCategoryId, companyId },
      },
      data: { deletedAt: new Date() },
    })
    return { message: 'Company Business Category unlinked successfully' }
  }

  async activate(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.updateItem<
      { isActive: boolean },
      CompanyBusinessCategoryWithCategory
    >({
      where: {
        businessCategoryId_companyId: { businessCategoryId, companyId },
      },
      data: { isActive: true },
      include: { businessCategory: true },
    })
  }

  async deactivate(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.updateItem<
      { isActive: boolean },
      CompanyBusinessCategoryWithCategory
    >({
      where: {
        businessCategoryId_companyId: { businessCategoryId, companyId },
      },
      data: { isActive: false },
      include: { businessCategory: true },
    })
  }
}
