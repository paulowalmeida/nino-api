import { Injectable, NotFoundException } from '@nestjs/common'

import { BusinessCategory } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { BusinessCategoryQueryDto } from './dtos/business-category-query.dto'
import { CreateBusinessCategoryDto } from './dtos/create-business-category.dto'
import { UpdateBusinessCategoryDto } from './dtos/update-business-category.dto'
import { BusinessCategoryPaginatedResponse } from './types/business-category-paginated-response.type'

@Injectable()
export class BusinessCategoryRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

  async getAll(
    query: BusinessCategoryQueryDto,
  ): Promise<BusinessCategoryPaginatedResponse> {
    try {
      const params = this.paginationService.getPaginationParams(query)
      const orderBy = query.orderBy ?? 'name'
      const orderDir = query.orderDir ?? 'ASC'
      const [data, total] = await Promise.all([
        this.prisma.businessCategory.findMany({
          where: { deletedAt: null },
          orderBy: { [orderBy]: orderDir.toLowerCase() },
          skip: params.skip,
          take: params.take,
        }),
        this.prisma.businessCategory.count({ where: { deletedAt: null } }),
      ])
      return this.paginationService.paginate(data, total, query)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<BusinessCategory> {
    try {
      const found = await this.prisma.businessCategory.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Business Category not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateBusinessCategoryDto): Promise<BusinessCategory> {
    try {
      return await this.prisma.businessCategory.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    data: UpdateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    try {
      await this.getById(id)
      return await this.prisma.businessCategory.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.businessCategory.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Business Category deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
