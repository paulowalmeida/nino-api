import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { TenantRole } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateTenantRoleDto } from './dtos/create-tenant-role.dto'
import { UpdateTenantRoleDto } from './dtos/update-tenant-role.dto'

@Injectable()
export class TenantRoleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<TenantRole[]> {
    try {
      return await this.prisma.tenantRole.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<TenantRole> {
    try {
      const found = await this.prisma.tenantRole.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('TenantRole not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByName(name: string): Promise<TenantRole> {
    try {
      const found = await this.prisma.tenantRole.findFirst({
        where: { name, deletedAt: null },
      })
      if (!found) throw new NotFoundException('TenantRole not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateTenantRoleDto): Promise<TenantRole> {
    try {
      const exists = await this.prisma.tenantRole.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return await this.prisma.tenantRole.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateTenantRoleDto): Promise<TenantRole> {
    try {
      const role = await this.getById(id)
      if (data.name && data.name !== role.name) {
        const exists = await this.prisma.tenantRole.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.tenantRole.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.tenantRole.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'TenantRole deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
