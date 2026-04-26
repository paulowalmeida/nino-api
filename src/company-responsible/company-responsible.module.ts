import { Module } from '@nestjs/common'

import { PrismaModule } from '@shared/services/prisma/prisma.module'
import { CompanyResponsibleController } from './company-responsible.controller'
import { CompanyResponsibleRepository } from './company-responsible.repository'
import { CompanyResponsibleService } from './company-responsible.service'

@Module({
  imports: [PrismaModule],
  controllers: [CompanyResponsibleController],
  providers: [CompanyResponsibleService, CompanyResponsibleRepository],
  exports: [CompanyResponsibleService],
})
export class CompanyResponsibleModule {}
