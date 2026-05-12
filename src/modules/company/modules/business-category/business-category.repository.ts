import { Injectable } from '@nestjs/common'

import { BusinessCategory, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { BusinessCategoryQueryDto } from './dtos/business-category-query.dto'
import { CreateBusinessCategoryDto } from './dtos/create-business-category.dto'
import { UpdateBusinessCategoryDto } from './dtos/update-business-category.dto'
import { BusinessCategoryPaginatedResponse } from './types/business-category-paginated-response.type'

@Injectable()
export class BusinessCategoryRepository
  extends BaseRepository<Prisma.BusinessCategoryDelegate> {
  constructor(
    prisma: PrismaService,
    errorService: ErrorService,
    paginationService: PaginationService,
  ) {
    super(errorService, prisma.businessCategory, 'Business Category', paginationService)
  }

  async getAll(
    query: BusinessCategoryQueryDto,
  ): Promise<BusinessCategoryPaginatedResponse> {
    return this.findAllPaginated<BusinessCategory>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      orderBy: { [query.orderBy ?? 'name']: 'asc' },
    })
  }

  async getById(id: string): Promise<BusinessCategory> {
    return this.findItem<BusinessCategory>({ where: { id } })
  }

  async create(data: CreateBusinessCategoryDto): Promise<BusinessCategory> {
    return this.insert<CreateBusinessCategoryDto, BusinessCategory>({ data })
  }

  async update(
    id: string,
    data: UpdateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    return this.updateItem<UpdateBusinessCategoryDto, BusinessCategory>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
