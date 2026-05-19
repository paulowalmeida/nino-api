import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateTenantDto } from './dtos/create-tenant.dto'
import { TenantQueryDto } from './dtos/tenant-query.dto'
import { UpdateTenantDto } from './dtos/update-tenant.dto'
import { TenantFull } from './types/tenant-full.type'
import { TenantOrderBy } from './types/tenant-order-by.type'
import { TenantPaginatedResponse } from './types/tenant-paginated-response.type'
import { TenantResponse } from './types/tenant-response.type'

@Injectable()
export class TenantRepository
  extends BaseRepository<Prisma.TenantDelegate>
  implements IBaseLookupRepository<
    TenantResponse,
    CreateTenantDto,
    UpdateTenantDto,
    TenantQueryDto,
    TenantPaginatedResponse
  > {
  private readonly TENANT_INCLUDE = {
    tenantStatus: true,
    tenantype: true,
    company: true,
  } as const

  constructor(
    prisma: PrismaService,
    paginationService: PaginationService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.tenant, 'Tenant', paginationService)
  }

  private toResponse(tenant: TenantFull): TenantResponse {
    const {
      deletedAt: _,
      statusId: _s,
      typeId: _t,
      companyId: _c,
      tenantStatus: status,
      tenantype: type,
      company,
      ...rest
    } = tenant
    return { ...rest, status, type, company }
  }

  async getAll(query: TenantQueryDto): Promise<TenantPaginatedResponse> {
    const orderBy = query.orderBy ?? TenantOrderBy.CREATED_AT
    const where = query.companyId ? { companyId: query.companyId } : {}
    const result = await this.findAllPaginated<TenantFull>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      where,
      orderBy: { [orderBy]: query.orderDir?.toLowerCase() ?? 'asc' },
      include: this.TENANT_INCLUDE,
    })
    return { ...result, data: result.data.map((t) => this.toResponse(t)) }
  }

  async getById(id: string): Promise<TenantResponse> {
    const tenant = await this.findItem<TenantFull>({
      where: { id },
      include: this.TENANT_INCLUDE,
    })
    return this.toResponse(tenant)
  }

  async getBySlug(slug: string): Promise<TenantResponse> {
    const tenant = await this.findItem<TenantFull>({
      where: { slug },
      include: this.TENANT_INCLUDE,
    })
    return this.toResponse(tenant)
  }

  async create(data: CreateTenantDto): Promise<TenantResponse> {
    const tenant = await this.insert<CreateTenantDto, TenantFull>({
      data,
      include: this.TENANT_INCLUDE,
    })
    return this.toResponse(tenant)
  }

  async update(id: string, data: UpdateTenantDto): Promise<TenantResponse> {
    const tenant = await this.updateItem<UpdateTenantDto, TenantFull>({
      where: { id },
      data,
      include: this.TENANT_INCLUDE,
    })
    return this.toResponse(tenant)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
