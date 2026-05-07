import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { CompanyBusinessCategoryController } from './company-business-category.controller'
import { CompanyBusinessCategoryRepository } from './company-business-category.repository'
import { CompanyBusinessCategoryService } from './company-business-category.service'

@Module({
  controllers: [CompanyBusinessCategoryController],
  providers: [
    CompanyBusinessCategoryService,
    CompanyBusinessCategoryRepository,
    ErrorService,
  ],
  exports: [CompanyBusinessCategoryService],
})
export class CompanyBusinessCategoryModule {}
