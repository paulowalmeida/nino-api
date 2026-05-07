import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { BusinessCategoryController } from './business-category.controller'
import { BusinessCategoryRepository } from './business-category.repository'
import { BusinessCategoryService } from './business-category.service'

@Module({
  controllers: [BusinessCategoryController],
  providers: [
    BusinessCategoryRepository,
    BusinessCategoryService,
    ErrorService,
    PaginationService,
  ],
  exports: [BusinessCategoryService],
})
export class BusinessCategoryModule {}
