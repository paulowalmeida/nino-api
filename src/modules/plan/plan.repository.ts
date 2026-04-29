import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'
import { Plan } from './entities/plan.entity'
import { PlanResponse } from './types/plan.response.type'

@Injectable()
export class PlanRepository {
  constructor(
    @InjectRepository(Plan)
    private readonly repository: Repository<Plan>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<PlanResponse[]> {
    try {
      const plans = await this.repository.find({
        order: { name: 'ASC' },
        relations: ['type'],
      })
      return plans.map(({ typeId: _, type, ...rest }) => ({
        ...rest,
        type: { name: type.name },
      }))
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: number): Promise<PlanResponse> {
    try {
      const found = await this.repository.findOne({
        where: { id },
        relations: ['type'],
      })
      if (!found) throw new NotFoundException('Plan not found')
      const { typeId: _, type, ...rest } = found
      return { ...rest, type: { name: type.name } }
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreatePlanDto): Promise<PlanResponse> {
    try {
      const exists = await this.repository.findOneBy({ slug: data.slug })
      if (exists) throw new ConflictException('Slug already exists')

      const saved = await this.repository.save(this.repository.create(data))
      return this.getById(saved.id)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: number, data: UpdatePlanDto): Promise<void> {
    try {
      const plan = await this.repository.findOne({ where: { id } })
      if (!plan) throw new NotFoundException('Plan not found')

      if (data.slug && data.slug !== plan.slug) {
        const exists = await this.repository.findOneBy({ slug: data.slug })
        if (exists) throw new ConflictException('Slug already exists')
      }

      Object.assign(plan, data)
      await this.repository.save(plan)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: number): Promise<void> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
