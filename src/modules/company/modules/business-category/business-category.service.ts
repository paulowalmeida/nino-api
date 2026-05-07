import { Injectable } from '@nestjs/common'

import { BusinessCategory } from '@prisma/client'

import { BusinessCategoryRepository } from './business-category.repository'
import { BusinessCategoryQueryDto } from './dtos/business-category-query.dto'
import { CreateBusinessCategoryDto } from './dtos/create-business-category.dto'
import { UpdateBusinessCategoryDto } from './dtos/update-business-category.dto'
import { BusinessCategoryPaginatedResponse } from './types/business-category-paginated-response.type'

@Injectable()
export class BusinessCategoryService {
  constructor(private readonly repo: BusinessCategoryRepository) {}

  async getAll(
    query: BusinessCategoryQueryDto,
  ): Promise<BusinessCategoryPaginatedResponse> {
    return this.repo.getAll(query)
  }

  async getById(id: string): Promise<BusinessCategory> {
    return this.repo.getById(id)
  }

  async create(data: CreateBusinessCategoryDto): Promise<BusinessCategory> {
    return this.repo.create(data)
  }

  async update(
    id: string,
    data: UpdateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
