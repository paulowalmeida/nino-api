import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'
import { PlanTypeController } from './plan-type.controller'
import { PlanTypeRepository } from './plan-type.repository'
import { PlanTypeService } from './plan-type.service'

@Module({
  controllers: [PlanTypeController],
  providers: [PlanTypeService, PlanTypeRepository, ErrorService],
  exports: [PlanTypeService],
})
export class PlanTypeModule {}
