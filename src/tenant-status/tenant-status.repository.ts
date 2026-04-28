import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { TenantStatus } from '@tenant-status/entities/tenant-status.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'

@Injectable()
export class TenantStatusRepository {
  constructor(
    @InjectRepository(TenantStatus)
    private readonly repository: Repository<TenantStatus>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<TenantStatus[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<TenantStatus> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Tenant Status not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateTenantStatusDto): Promise<TenantStatus> {
    try {
      const exists = await this.repository.findOneBy({ name: data.name })
      if (exists) throw new ConflictException('Name already exists')

      const tenantStatus = this.repository.create(data)
      return await this.repository.save(tenantStatus)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateTenantStatusDto): Promise<TenantStatus> {
    try {
      const tenantStatus = await this.getById(id)

      if (data.name && data.name !== tenantStatus.name) {
        const exists = await this.repository.findOneBy({ name: data.name })
        if (exists) throw new ConflictException('Name already exists')
      }

      Object.assign(tenantStatus, data)
      return await this.repository.save(tenantStatus)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
      return { message: 'Tenant Status deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
