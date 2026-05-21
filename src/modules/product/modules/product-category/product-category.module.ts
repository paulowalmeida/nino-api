import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'

import { ProductCategoryController } from './product-category.controller'
import { ProductCategoryRepository } from './product-category.repository'
import { ProductCategoryService } from './product-category.service'

@Module({
  controllers: [ProductCategoryController],
  providers: [ProductCategoryService, ProductCategoryRepository, ErrorService],
  exports: [ProductCategoryService, ProductCategoryRepository],
})
export class ProductCategoryModule {}
