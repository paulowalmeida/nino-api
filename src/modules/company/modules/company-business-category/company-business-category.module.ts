import { Module } from '@nestjs/common'

import { CompanyBusinessCategoryController } from './company-business-category.controller'
import { CompanyBusinessCategoryRepository } from './company-business-category.repository'
import { CompanyBusinessCategoryService } from './company-business-category.service'

@Module({
  controllers: [CompanyBusinessCategoryController],
  providers: [
    CompanyBusinessCategoryService,
    CompanyBusinessCategoryRepository,
  ],
  exports: [CompanyBusinessCategoryService],
})
export class CompanyBusinessCategoryModule {}
