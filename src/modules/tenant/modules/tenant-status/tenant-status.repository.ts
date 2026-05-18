import { Injectable } from '@nestjs/common'

import { Prisma, TenantStatus } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'

@Injectable()
export class TenantStatusRepository
  extends BaseRepository<Prisma.TenantStatusDelegate>
  implements IBaseLookupRepository<
    TenantStatus,
    CreateTenantStatusDto,
    UpdateTenantStatusDto
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.tenantStatus, 'Tenant Status')
  }

  async getAll(): Promise<TenantStatus[]> {
    return this.findAll<TenantStatus>({ orderBy: { name: 'asc' } })
  }

  async getById(id: string): Promise<TenantStatus> {
    return this.findItem<TenantStatus>({ where: { id } })
  }

  async create(data: CreateTenantStatusDto): Promise<TenantStatus> {
    return this.insert<CreateTenantStatusDto, TenantStatus>({ data })
  }

  async update(
    id: string,
    data: UpdateTenantStatusDto,
  ): Promise<TenantStatus> {
    return this.updateItem<UpdateTenantStatusDto, TenantStatus>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
