import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PlanType } from './types/plan-type.type'
import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'

@Injectable()
export class PlanTypeRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getAll(): Promise<PlanType[]> {
    try {
      return await this.prisma.planType.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<PlanType> {
    try {
      const found = await this.prisma.planType.findUnique({
        where: { id },
      })

      if (!found) throw new NotFoundException('Plan Type not found')

      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async create(data: CreatePlanTypeDto): Promise<PlanType> {
    try {
      const existsByName = await this.prisma.planType.findUnique({
        where: { name: data.name },
      })
      if (existsByName) throw new ConflictException('Name already exists')

      return await this.prisma.planType.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdatePlanTypeDto): Promise<PlanType> {
    try {
      if (data.name) {
        const found = await this.prisma.planType.findUnique({
          where: { name: data.name },
        })

        if (found && found.id !== id) {
          throw new ConflictException('Name already exists')
        }
      }

      return await this.prisma.planType.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.planType.delete({ where: { id } })
      return { message: 'Plan Type deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
