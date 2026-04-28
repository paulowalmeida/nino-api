import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { PlanType } from '@plan-type/entities/plan-type.entity'
import { ErrorService } from '@shared/services/error/error.service'
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
