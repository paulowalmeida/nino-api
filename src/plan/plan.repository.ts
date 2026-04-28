import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Plan } from '@plan/entities/plan.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreatePlanDto } from './dtos/create-plan.dto'
import { UpdatePlanDto } from './dtos/update-plan.dto'

@Injectable()
export class PlanRepository {
  constructor(
    @InjectRepository(Plan)
    private readonly repository: Repository<Plan>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<Plan[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: number): Promise<Plan> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Plan not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreatePlanDto): Promise<Plan> {
    try {
      const exists = await this.repository.findOneBy({ slug: data.slug })
      if (exists) throw new ConflictException('Slug already exists')

      const plan = this.repository.create(data)
      return await this.repository.save(plan)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: number, data: UpdatePlanDto): Promise<void> {
    try {
      const plan = await this.getById(id)

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
