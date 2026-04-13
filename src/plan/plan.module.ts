import { Module } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PlanService } from './plan.service'
import { PlanRepository } from './plan.repository'
import { PlanController } from './plan.controller'

@Module({
  controllers: [PlanController],
  providers: [PlanService, PlanRepository, PrismaService, PrismaErrorService],
  exports: [PlanService],
})
export class PlanModule {}
