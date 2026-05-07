import { Module } from '@nestjs/common'

import { BusinessCategoryController } from './business-category.controller'
import { BusinessCategoryRepository } from './business-category.repository'
import { BusinessCategoryService } from './business-category.service'

@Module({
  providers: [BusinessCategoryRepository, BusinessCategoryService],
  exports: [BusinessCategoryService],
  controllers: [BusinessCategoryController],
})
export class BusinessCategoryModule {}
