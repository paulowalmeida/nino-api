import { Module } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PlanController } from './plan.controller'
import { PlanRepository } from './plan.repository'
import { PlanService } from './plan.service'

@Module({
  controllers: [PlanController],
  providers: [PlanService, PlanRepository, PrismaService, PrismaErrorService],
  exports: [PlanService],
})
export class PlanModule {}
