import { Injectable } from '@nestjs/common'

import { ProductRepository } from './product.repository'
import { CreateProductDto } from './dtos/create-product.dto'
import { ProductQueryDto } from './dtos/product-query.dto'
import { UpdateProductDto } from './dtos/update-product.dto'
import { ProductFull } from './types/product-full.type'
import { ProductPaginatedResponse } from './types/product-paginated-response.type'
import { ProductResponse } from './types/product-response.type'

@Injectable()
export class ProductService {
  private readonly include = { category: true } as const

  constructor(private readonly repo: ProductRepository) {}

  private toResponse(product: ProductFull): ProductResponse {
    const { categoryId: _, deletedAt: __, category, ...rest } = product
    return { ...rest, category: { id: category.id, name: category.name } }
  }

  async getAll(
    tenantId: string,
    query: ProductQueryDto,
  ): Promise<ProductPaginatedResponse> {
    const where: Record<string, unknown> = { tenantId }
    if (query.categoryId) where['categoryId'] = query.categoryId
    if (query.isActive !== undefined) where['isActive'] = query.isActive

    const paginated = await this.repo.findAllPaginated<ProductFull>({
      where,
      page: query.page,
      size: query.size,
      order: {
        target: query.target ?? 'position',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
    })

    return {
      ...paginated,
      data: paginated.data.map((p) => this.toResponse(p)),
    }
  }

  async getById(id: string): Promise<ProductResponse> {
    const product = await this.repo.findItem<ProductFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(product)
  }

  async create(
    tenantId: string,
    data: CreateProductDto,
  ): Promise<ProductResponse> {
    const product = await this.repo.insert<
      CreateProductDto & { tenantId: string },
      ProductFull
    >({ data: { ...data, tenantId }, include: this.include })
    return this.toResponse(product)
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductResponse> {
    const product = await this.repo.updateItem<UpdateProductDto, ProductFull>({
      where: { id },
      data,
      include: this.include,
    })
    return this.toResponse(product)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
