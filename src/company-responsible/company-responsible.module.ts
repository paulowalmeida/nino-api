import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { CompanyResponsible } from '@company-responsible/entities/company-responsible.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CompanyResponsibleController } from './company-responsible.controller'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleService } from './company-responsible.service'

@Module({
  imports: [TypeOrmModule.forFeature([CompanyResponsible])],
  controllers: [CompanyResponsibleController],
  providers: [CompanyResponsibleService, CompanyResponsibleRepository, ErrorService],
  exports: [CompanyResponsibleService],
})
export class CompanyResponsibleModule {}
