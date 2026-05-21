import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { ProductCategory } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateProductCategoryDto } from './dtos/create-product-category.dto'
import { UpdateProductCategoryDto } from './dtos/update-product-category.dto'
import { ProductCategoryService } from './product-category.service'
import { ProductCategoryPaginatedResponse } from './types/product-category-paginated-response.type'

@Controller('tenants/:tenantId/product-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductCategoryController {
  constructor(private readonly service: ProductCategoryService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getAll(
    @Param('tenantId') tenantId: string,
    @Query() query: PaginatedQueryDto,
  ): Promise<ProductCategoryPaginatedResponse> {
    return this.service.getAll(tenantId, query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getById(@Param('id') id: string): Promise<ProductCategory> {
    return this.service.getById(id)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateProductCategoryDto,
  ): Promise<ProductCategory> {
    return this.service.create(dto, { tenantId })
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductCategoryDto,
  ): Promise<ProductCategory> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
