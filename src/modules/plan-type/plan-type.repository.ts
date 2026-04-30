import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CreatePlanTypeDto } from './dtos/create-plan-type.dto'
import { UpdatePlanTypeDto } from './dtos/update-plan-type.dto'
import { PlanType } from './entities/plan-type.entity'

@Injectable()
export class PlanTypeRepository {
  constructor(
    @InjectRepository(PlanType)
    private readonly repository: Repository<PlanType>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<PlanType[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<PlanType> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Plan Type not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreatePlanTypeDto): Promise<PlanType> {
    try {
      const exists = await this.repository.findOneBy({ name: data.name })
      if (exists) throw new ConflictException('Name already exists')

      const planType = this.repository.create(data)
      return await this.repository.save(planType)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdatePlanTypeDto): Promise<PlanType> {
    try {
      const planType = await this.getById(id)

      if (data.name && data.name !== planType.name) {
        const exists = await this.repository.findOneBy({ name: data.name })
        if (exists) throw new ConflictException('Name already exists')
      }

      Object.assign(planType, data)
      return await this.repository.save(planType)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.softDelete(id)
      return { message: 'Plan Type deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
