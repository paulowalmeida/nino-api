import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PlanType } from './entities/plan-type.entity'
import { PlanTypeController } from './plan-type.controller'
import { PlanTypeRepository } from './plan-type.repository'
import { PlanTypeService } from './plan-type.service'

@Module({
  imports: [TypeOrmModule.forFeature([PlanType])],
  controllers: [PlanTypeController],
  providers: [PlanTypeService, PlanTypeRepository, ErrorService],
  exports: [PlanTypeService],
})
export class PlanTypeModule {}
