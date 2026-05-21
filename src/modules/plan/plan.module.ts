import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PlanController } from './plan.controller'
import { PlanRepository } from './plan.repository'
import { PlanService } from './plan.service'

@Module({
  controllers: [PlanController],
  providers: [PlanService, PlanRepository, ErrorService, PaginationService],
  exports: [PlanService],
})
export class PlanModule {}
