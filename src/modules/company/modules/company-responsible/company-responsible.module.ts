import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { CompanyResponsibleController } from './company-responsible.controller'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleService } from './company-responsible.service'

@Module({
  controllers: [CompanyResponsibleController],
  providers: [
    CompanyResponsibleService,
    CompanyResponsibleRepository,
    ErrorService,
    PaginationService,
  ],
  exports: [CompanyResponsibleService],
})
export class CompanyResponsibleModule {}
