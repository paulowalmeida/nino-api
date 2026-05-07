import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { CompanyResponsibleController } from './company-responsible.controller'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleService } from './company-responsible.service'

@Module({
  controllers: [CompanyResponsibleController],
  providers: [
    CompanyResponsibleService,
    CompanyResponsibleRepository,
    ErrorService,
  ],
  exports: [CompanyResponsibleService],
})
export class CompanyResponsibleModule {}
