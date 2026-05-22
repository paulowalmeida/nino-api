import { Injectable } from '@nestjs/common'

import { TenantPhone } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'

import { CreateTenantPhoneDto } from './dtos/create-tenant-phone.dto'
import { UpdateTenantPhoneDto } from './dtos/update-tenant-phone.dto'
import { TenantPhoneRepository } from './tenant-phone.repository'
import { TenantPhonePaginatedResponse } from './types/tenant-phone-paginated-response.type'

@Injectable()
export class TenantPhoneService {
  constructor(private readonly repo: TenantPhoneRepository) {}

  async getAll(
    tenantId: string,
    query: PaginatedQueryDto,
  ): Promise<TenantPhonePaginatedResponse> {
    return this.repo.findAllPaginated<TenantPhone>({
      where: { tenantId },
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      page: query.page,
      size: query.size,
    })
  }

  async getById(id: string): Promise<TenantPhone> {
    return this.repo.findItem<TenantPhone>({ where: { id } })
  }

  async create(data: CreateTenantPhoneDto): Promise<TenantPhone> {
    return this.repo.insert<CreateTenantPhoneDto, TenantPhone>({ data })
  }

  async update(id: string, data: UpdateTenantPhoneDto): Promise<TenantPhone> {
    return this.repo.updateItem<UpdateTenantPhoneDto, TenantPhone>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
