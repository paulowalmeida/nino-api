import { Injectable } from '@nestjs/common'

import { ProductCategory } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CreateProductCategoryDto } from './dtos/create-product-category.dto'
import { UpdateProductCategoryDto } from './dtos/update-product-category.dto'
import { ProductCategoryRepository } from './product-category.repository'
import { ProductCategoryPaginatedResponse } from './types/product-category-paginated-response.type'

@Injectable()
export class ProductCategoryService {
  constructor(private readonly repo: ProductCategoryRepository) {}

  async getAll(
    tenantId: string,
    query: PaginatedQueryDto,
  ): Promise<ProductCategoryPaginatedResponse> {
    return this.repo.findAllPaginated<ProductCategory>({
      where: { tenantId },
      order: { 
        target: query.target ?? 'position',
        direction: query.direction ?? 'asc'
      },
      page: query.page,
      size: query.size,
    })
  }

  async getById(id: string): Promise<ProductCategory> {
    return this.repo.findItem<ProductCategory>({ where: { id } })
  }

  async create(
    dto: CreateProductCategoryDto,
    extra?: Record<string, unknown>,
  ): Promise<ProductCategory> {
    return this.repo.insert<Record<string, unknown>, ProductCategory>({
      data: { ...dto, ...extra },
    })
  }

  async update(
    id: string,
    dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    return this.repo.updateItem<UpdateProductCategoryDto, ProductCategory>({
      where: { id },
      data: dto,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
