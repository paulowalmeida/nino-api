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

import { Public } from '@shared/decorators/public.decorator'
import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateProductDto } from './dtos/create-product.dto'
import { ProductQueryDto } from './dtos/product-query.dto'
import { UpdateProductDto } from './dtos/update-product.dto'
import { ProductPaginatedResponse } from './types/product-paginated-response.type'
import { ProductService } from './product.service'
import { ProductResponse } from './types/product-response.type'

@Controller('tenants/:tenantId/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly service: ProductService) {}

  @Get()
  @Public()
  async getAll(
    @Param('tenantId') tenantId: string,
    @Query() query: ProductQueryDto,
  ): Promise<ProductPaginatedResponse> {
    return this.service.getAll(tenantId, query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  async getById(@Param('id') id: string): Promise<ProductResponse> {
    return this.service.getById(id)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async create(
    @Param('tenantId') tenantId: string,
    @Body() dto: CreateProductDto,
  ): Promise<ProductResponse> {
    return this.service.create(tenantId, dto)
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponse> {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.MERCHANT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
