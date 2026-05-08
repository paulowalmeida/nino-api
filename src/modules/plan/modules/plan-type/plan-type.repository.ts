import { ConflictException, Injectable } from '@nestjs/common'

import { PlanType } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'

@Injectable()
export class PlanTypeRepository extends BaseRepository {
  constructor(
    private readonly prisma: PrismaService,
    errorService: ErrorService,
  ) {
    super(errorService)
  }

  async getAll(): Promise<PlanType[]> {
    return this.findMany<PlanType[]>(this.prisma.planType)
  }

  async getById(id: string): Promise<PlanType> {
    return this.getFirst<PlanType, string>(this.prisma.planType, 'id', id)
  }

  async create(data: CreatePlanTypeDto): Promise<PlanType> {
    return this.executeFnWithTryCatch(async () => {
      const exists = await this.prisma.planType.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return this.prisma.planType.create({ data })
    })
  }

  async update(id: string, data: UpdatePlanTypeDto): Promise<PlanType> {
    return this.executeFnWithTryCatch(async () => {
      const item = await this.getById(id)
      if (data.name && data.name !== item.name) {
        const exists = await this.prisma.planType.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return this.prisma.planType.update({ where: { id }, data })
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(this.prisma.planType, id)
  }
}
