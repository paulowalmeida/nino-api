import { Injectable } from '@nestjs/common'

import { CompanyBusinessCategoryRepository } from './company-business-category.repository'
import { CompanyBusinessCategoryWithCategory } from './types/company-business-category-with-category.type'

@Injectable()
export class CompanyBusinessCategoryService {
  constructor(private readonly repo: CompanyBusinessCategoryRepository) {}

  async getByCompanyId(
    companyId: string,
  ): Promise<CompanyBusinessCategoryWithCategory[]> {
    return this.repo.getByCompanyId(companyId)
  }

  async link(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.repo.create(companyId, { businessCategoryId })
  }

  async unlink(
    companyId: string,
    businessCategoryId: string,
  ): Promise<{ message: string }> {
    return this.repo.delete(companyId, businessCategoryId)
  }

  async activate(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.repo.activate(companyId, businessCategoryId)
  }

  async deactivate(
    companyId: string,
    businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.repo.deactivate(companyId, businessCategoryId)
  }
}
