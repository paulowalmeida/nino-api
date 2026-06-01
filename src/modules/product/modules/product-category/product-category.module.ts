import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'

import { ProductCategoryController } from './product-category.controller'
import { ProductCategoryRepository } from './product-category.repository'
import { ProductCategoryService } from './product-category.service'

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService, ProductCategoryRepository, ErrorService, PaginationService],
  exports: [ProductCategoryService, ProductCategoryRepository],
})
export class ProductCategoryModule {}
