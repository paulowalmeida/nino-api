import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import {
  PaginationService,
} from '@shared/services/pagination/pagination.service'
import { CompanyController } from './company.controller'
import { CompanyRepository } from './company.repository'
import { CompanyService } from './company.service'

@Module({
  controllers: [CompanyController],
  providers: [
    CompanyService,
    CompanyRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [CompanyService],
})
export class CompanyModule {}
