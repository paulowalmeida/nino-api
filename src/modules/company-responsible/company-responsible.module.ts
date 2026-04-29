import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CompanyResponsibleController } from './company-responsible.controller'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleService } from './company-responsible.service'
import { CompanyResponsible } from './entities/company-responsible.entity'

@Module({
  imports: [TypeOrmModule.forFeature([CompanyResponsible])],
  controllers: [CompanyResponsibleController],
  providers: [
    CompanyResponsibleService,
    CompanyResponsibleRepository,
    ErrorService,
  ],
  exports: [CompanyResponsibleService],
})
export class CompanyResponsibleModule {}
