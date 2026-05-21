import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { ProductCategoryModule } from './modules/product-category/product-category.module'
import { ProductController } from './product.controller'
import { ProductRepository } from './product.repository'
import { ProductService } from './product.service'

@Module({
  imports: [ProductCategoryModule],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [ProductService, ProductRepository],
})
export class ProductModule {}
