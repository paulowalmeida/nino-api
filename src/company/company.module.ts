import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Company } from '@company/entities/company.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CompanyController } from './company.controller'
import { CompanyRepository } from './company.repository'
import { CompanyService } from './company.service'

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository, ErrorService],
  exports: [CompanyService],
})
export class CompanyModule {}
