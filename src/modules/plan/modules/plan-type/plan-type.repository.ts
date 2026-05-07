import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PlanType } from '@prisma/client'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { ErrorService } from '@shared/services/error/error.service'
import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'

@Injectable()
export class PlanTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<PlanType[]> {
    try {
      return await this.prisma.planType.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<PlanType> {
    try {
      const found = await this.prisma.planType.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Plan Type not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreatePlanTypeDto): Promise<PlanType> {
    try {
      const exists = await this.prisma.planType.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return await this.prisma.planType.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdatePlanTypeDto): Promise<PlanType> {
    try {
      const item = await this.getById(id)
      if (data.name && data.name !== item.name) {
        const exists = await this.prisma.planType.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.planType.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.planType.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Plan Type deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
