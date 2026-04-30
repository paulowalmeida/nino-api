import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { CompanyController } from './company.controller'
import { CompanyRepository } from './company.repository'
import { CompanyService } from './company.service'
import { Company } from './entities/company.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Company])],
  controllers: [CompanyController],
  providers: [CompanyService, CompanyRepository, ErrorService, PaginationService],
  exports: [CompanyService],
})
export class CompanyModule {}
