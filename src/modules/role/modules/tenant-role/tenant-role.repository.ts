import { Injectable } from '@nestjs/common'

import { Prisma, TenantRole } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateTenantRoleDto } from './dtos/create-tenant-role.dto'
import { UpdateTenantRoleDto } from './dtos/update-tenant-role.dto'

@Injectable()
export class TenantRoleRepository
  extends BaseRepository<Prisma.TenantRoleDelegate>
  implements IBaseLookupRepository<
    TenantRole,
    CreateTenantRoleDto,
    UpdateTenantRoleDto
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.tenantRole, 'Tenant Role')
  }

  async getAll(): Promise<TenantRole[]> {
    return this.findAll<TenantRole>({ orderBy: { name: 'asc' } })
  }

  async getById(id: string): Promise<TenantRole> {
    return this.findItem<TenantRole>({ where: { id } })
  }

  async getByName(name: string): Promise<TenantRole> {
    return this.findItem<TenantRole>({ where: { name } })
  }

  async create(data: CreateTenantRoleDto): Promise<TenantRole> {
    return this.insert<CreateTenantRoleDto, TenantRole>({ data })
  }

  async update(id: string, data: UpdateTenantRoleDto): Promise<TenantRole> {
    return this.updateItem<UpdateTenantRoleDto, TenantRole>({ where: { id }, data })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
