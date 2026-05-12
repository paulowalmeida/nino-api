import { Injectable } from '@nestjs/common'

import { PlanType, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'

@Injectable()
export class PlanTypeRepository
  extends BaseRepository<Prisma.PlanTypeDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.planType, 'Plan Type')
  }

  async getAll(): Promise<PlanType[]> {
    return this.findAll<PlanType>()
  }

  async getById(id: string): Promise<PlanType> {
    return this.findItem<PlanType>({ where: { id } })
  }

  async create(data: CreatePlanTypeDto): Promise<PlanType> {
    return this.insert<CreatePlanTypeDto, PlanType>({ data })
  }

  async update(id: string, data: UpdatePlanTypeDto): Promise<PlanType> {
    return this.updateItem<UpdatePlanTypeDto, PlanType>({ where: { id }, data })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
