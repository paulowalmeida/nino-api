import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { TenantStatus } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'

@Injectable()
export class TenantStatusRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<TenantStatus[]> {
    try {
      return await this.prisma.tenantStatus.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<TenantStatus> {
    try {
      const found = await this.prisma.tenantStatus.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('Tenant Status not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateTenantStatusDto): Promise<TenantStatus> {
    try {
      const exists = await this.prisma.tenantStatus.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return await this.prisma.tenantStatus.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateTenantStatusDto): Promise<TenantStatus> {
    try {
      const item = await this.getById(id)
      if (data.name && data.name !== item.name) {
        const exists = await this.prisma.tenantStatus.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.tenantStatus.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.tenantStatus.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'Tenant Status deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
