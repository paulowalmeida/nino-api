import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { Plan } from './entities/plan.entity'
import { PlanController } from './plan.controller'
import { PlanRepository } from './plan.repository'
import { PlanService } from './plan.service'

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  controllers: [PlanController],
  providers: [PlanService, PlanRepository, ErrorService],
  exports: [PlanService],
})
export class PlanModule {}
