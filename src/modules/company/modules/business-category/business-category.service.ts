import { Injectable } from '@nestjs/common'

import { BusinessCategory } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { BusinessCategoryRepository } from './business-category.repository'
import { CreateBusinessCategoryDto } from './dtos/create-business-category.dto'
import { UpdateBusinessCategoryDto } from './dtos/update-business-category.dto'
import { BusinessCategoryPaginatedResponse } from './types/business-category-paginated-response.type'

@Injectable()
export class BusinessCategoryService {
  constructor(private readonly repo: BusinessCategoryRepository) {}

  async getAll(
    params?: PaginatedQueryDto,
  ): Promise<BusinessCategoryPaginatedResponse> {
    return this.repo.findAllPaginated<BusinessCategory>({
      page: params?.page,
      size: params?.size,
      order: params?.target
        ? {
            target: params.target ?? 'name',
            direction: params.direction ?? 'asc',
          }
        : undefined,
    })
  }

  async getById(id: string): Promise<BusinessCategory> {
    return this.repo.findItem<BusinessCategory>({ where: { id } })
  }

  async create(data: CreateBusinessCategoryDto): Promise<BusinessCategory> {
    return this.repo.insert<CreateBusinessCategoryDto, BusinessCategory>({
      data,
    })
  }

  async update(
    id: string,
    data: UpdateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    return this.repo.updateItem<UpdateBusinessCategoryDto, BusinessCategory>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
