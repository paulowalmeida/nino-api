import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { CompanyController } from './company.controller'
import { CompanyRepository } from './company.repository'
import { CompanyService } from './company.service'
import { BusinessCategoryModule } from './modules/business-category/business-category.module'
import { CompanyBusinessCategoryModule } from './modules/company-business-category/company-business-category.module'

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [CompanyService],
  imports: [BusinessCategoryModule, CompanyBusinessCategoryModule],
})
export class CompanyModule {}
