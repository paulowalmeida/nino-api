import { Injectable } from '@nestjs/common'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

import { CreateCourierTenantDto } from './dtos/create-courier-tenant.dto'
import { CourierTenantFull } from './types/courier-tenant-full.type'
import { CourierTenantPaginatedResponse } from './types/courier-tenant-paginated-response.type'
import { CourierTenantResponse } from './types/courier-tenant-response.type'
import { CourierTenantRepository } from './courier-tenant.repository'

@Injectable()
export class CourierTenantService {
  private readonly include = {
    courier: { include: { globalRole: true, credentials: true } },
    tenant: true,
  } as const

  constructor(private readonly repo: CourierTenantRepository) {}

  private toResponse(item: CourierTenantFull): CourierTenantResponse {
    const { courierId: _, tenantId: _t, courier, tenant, ...rest } = item
    const {
      deletedAt: _d,
      globalRoleId: _r,
      globalRole: role,
      credentials: rawCredentials,
      ...courierRest
    } = courier
    return {
      ...rest,
      courier: {
        ...courierRest,
        role,
        credentials: rawCredentials.map(
          ({ password: _p, deletedAt: _cd, ...c }) => c,
        ),
      },
      tenant,
    }
  }

  async create(data: CreateCourierTenantDto): Promise<CourierTenantResponse> {
    const saved = await this.repo.insert<CreateCourierTenantDto, CourierTenantFull>({
      data,
      include: this.include,
    })
    return this.toResponse(saved)
  }

  async getByCourierId(
    courierId: string,
    query: PaginatedQueryDto,
  ): Promise<CourierTenantPaginatedResponse> {
    const result = await this.repo.findAllPaginated<CourierTenantFull>({
      where: { courierId },
      include: this.include,
      page: query.page,
      size: query.size,
      order: { target: query.target ?? 'createdAt', direction: query.direction ?? 'asc' },
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async getByTenantId(
    tenantId: string,
    query: PaginatedQueryDto,
  ): Promise<PaginatedResponse<CourierTenantResponse>> {
    const result = await this.repo.findAllPaginated<CourierTenantFull>({
      where: { tenantId },
      include: this.include,
      page: query.page,
      size: query.size,
      order: { target: query.target ?? 'createdAt', direction: query.direction ?? 'asc' },
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async delete(courierId: string, tenantId: string): Promise<{ message: string }> {
    return this.repo.softDelete({ courierId_tenantId: { courierId, tenantId } })
  }
}
