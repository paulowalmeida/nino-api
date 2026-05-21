import { Injectable } from '@nestjs/common'

import { TenantRepository } from './tenant.repository'
import { CreateTenantDto } from './dtos/create-tenant.dto'
import { TenantQueryDto } from './dtos/tenant-query.dto'
import { UpdateTenantDto } from './dtos/update-tenant.dto'
import { TenantFull } from './types/tenant-full.type'
import { TenantPaginatedResponse } from './types/tenant-paginated-response.type'
import { TenantResponse } from './types/tenant-response.type'

@Injectable()
export class TenantService {
  private readonly include = {
    tenantStatus: true,
    tenantype: true,
    company: true,
  } as const

  constructor(private readonly repo: TenantRepository) {}

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
    const where = query.companyId ? { companyId: query.companyId } : {}
    const result = await this.repo.findAllPaginated<TenantFull>({
      page: query.page,
      size: query.size,
      where,
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
    })
    return { ...result, data: result.data.map((t) => this.toResponse(t)) }
  }

  async getById(id: string): Promise<TenantResponse> {
    const tenant = await this.repo.findItem<TenantFull>({
      where: { id },
      include: this.include,
    })
    return this.toResponse(tenant)
  }

  async getBySlug(slug: string): Promise<TenantResponse> {
    const tenant = await this.repo.findItem<TenantFull>({
      where: { slug },
      include: this.include,
    })
    return this.toResponse(tenant)
  }

  async create(data: CreateTenantDto): Promise<TenantResponse> {
    const tenant = await this.repo.insert<CreateTenantDto, TenantFull>({
      data,
      include: this.include,
    })
    return this.toResponse(tenant)
  }

  async update(id: string, data: UpdateTenantDto): Promise<TenantResponse> {
    const tenant = await this.repo.updateItem<UpdateTenantDto, TenantFull>({
      where: { id },
      data,
      include: this.include,
    })
    return this.toResponse(tenant)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
