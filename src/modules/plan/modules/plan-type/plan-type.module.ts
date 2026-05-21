import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { PlanTypeController } from './plan-type.controller'

@Module({
  imports: [CommonModule.forFeature('planType', 'Plan Type')],
  controllers: [PlanTypeController],
})
export class PlanTypeModule {}
