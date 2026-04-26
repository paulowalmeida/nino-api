import { Module } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PlanTypeController } from './plan-type.controller'
import { PlanTypeRepository } from './plan-type.repository'
import { PlanTypeService } from './plan-type.service'

@Module({
  controllers: [PlanTypeController],
  providers: [
    PlanTypeService,
    PlanTypeRepository,
    PrismaService,
    PrismaErrorService,
  ],
  exports: [PlanTypeService],
})
export class PlanTypeModule {}
