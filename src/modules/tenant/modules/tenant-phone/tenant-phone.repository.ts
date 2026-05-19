import { Injectable } from '@nestjs/common'

import { Prisma, TenantPhone } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateTenantPhoneDto } from './dtos/create-tenant-phone.dto'
import { UpdateTenantPhoneDto } from './dtos/update-tenant-phone.dto'

@Injectable()
export class TenantPhoneRepository
  extends BaseRepository<Prisma.TenantPhoneDelegate>
  implements IBaseLookupRepository<
    TenantPhone,
    CreateTenantPhoneDto,
    UpdateTenantPhoneDto,
    string
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.tenantPhone, 'Tenant Phone')
  }

  async getAll(tenantId?: string): Promise<TenantPhone[]> {
    return this.findAll<TenantPhone>({ where: { tenantId } })
  }

  async getById(id: string): Promise<TenantPhone> {
    return this.findItem<TenantPhone>({ where: { id } })
  }

  async create(data: CreateTenantPhoneDto): Promise<TenantPhone> {
    return this.insert<CreateTenantPhoneDto, TenantPhone>({ data })
  }

  async update(id: string, data: UpdateTenantPhoneDto): Promise<TenantPhone> {
    return this.updateItem<UpdateTenantPhoneDto, TenantPhone>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
