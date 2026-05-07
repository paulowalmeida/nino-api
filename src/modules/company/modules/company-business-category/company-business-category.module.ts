import { Module } from '@nestjs/common'

import { CompanyBusinessCategoryRepository } from './company-business-category.repository'
import { CompanyBusinessCategoryService } from './company-business-category.service'

@Module({
  providers: [
    CompanyBusinessCategoryService,
    CompanyBusinessCategoryRepository,
  ],
  exports: [CompanyBusinessCategoryService],
})
export class CompanyBusinessCategoryModule {}
