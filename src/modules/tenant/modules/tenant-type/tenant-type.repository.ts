import { Injectable } from '@nestjs/common'

import { Prisma, TenantType } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateTenantTypeDto } from './dtos/create-tenant-type.dto'
import { UpdateTenantTypeDto } from './dtos/update-tenant-type.dto'

@Injectable()
export class TenantTypeRepository
  extends BaseRepository<Prisma.TenantTypeDelegate>
  implements IBaseLookupRepository<
    TenantType,
    CreateTenantTypeDto,
    UpdateTenantTypeDto
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.tenantType, 'Tenant Type')
  }

  async getAll(): Promise<TenantType[]> {
    return this.findAll<TenantType>({ orderBy: { name: 'asc' } })
  }

  async getById(id: string): Promise<TenantType> {
    return this.findItem<TenantType>({ where: { id } })
  }

  async create(data: CreateTenantTypeDto): Promise<TenantType> {
    return this.insert<CreateTenantTypeDto, TenantType>({ data })
  }

  async update(
    id: string,
    data: UpdateTenantTypeDto,
  ): Promise<TenantType> {
    return this.updateItem<UpdateTenantTypeDto, TenantType>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
