import { Injectable } from '@nestjs/common'

import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CompanyBusinessCategoryRepository } from './company-business-category.repository'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { CompanyBusinessCategoryWithCategory } from './types/company-business-category-with-category.type'

@Injectable()
export class CompanyBusinessCategoryService {
  private readonly include = { businessCategory: true } as const

  constructor(private readonly repo: CompanyBusinessCategoryRepository) {}

  async getByCompanyId(
    companyId: string,
    query: PaginatedQueryDto,
  ): Promise<PaginatedResponse<CompanyBusinessCategoryWithCategory>> {
    return this.repo.findAllPaginated<CompanyBusinessCategoryWithCategory>({
      where: { companyId },
      include: this.include,
      page: query.page,
      size: query.size,
    })
  }

  async link(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.repo.insert<
      { companyId: string; businessCategoryId: string },
      CompanyBusinessCategoryWithCategory
    >({
      data: { companyId, businessCategoryId },
      include: this.include,
    })
  }

  async unlink(
    companyId: string,
    businessCategoryId: string,
  ): Promise<{ message: string }> {
    return this.repo.softDelete({
      businessCategoryId_companyId: { businessCategoryId, companyId },
    })
  }

  async setActive(
    companyId: string,
    businessCategoryId: string,
    isActive: boolean,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.repo.updateItem<
      { isActive: boolean },
      CompanyBusinessCategoryWithCategory
    >({
      where: {
        businessCategoryId_companyId: { businessCategoryId, companyId },
      },
      data: { isActive },
      include: this.include,
    })
  }
}
