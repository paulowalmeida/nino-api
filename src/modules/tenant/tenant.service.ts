import { Injectable } from '@nestjs/common'

import { BaseService } from '@shared/services/base/base.service'
import { CreateTenantDto } from './dtos/create-tenant.dto'
import { TenantQueryDto } from './dtos/tenant-query.dto'
import { UpdateTenantDto } from './dtos/update-tenant.dto'
import { TenantRepository } from './tenant.repository'
import { TenantPaginatedResponse } from './types/tenant-paginated-response.type'
import { TenantResponse } from './types/tenant-response.type'

@Injectable()
export class TenantService extends BaseService<
  TenantResponse,
  CreateTenantDto,
  UpdateTenantDto,
  TenantQueryDto,
  TenantPaginatedResponse
> {
  constructor(private readonly repo: TenantRepository) {
    super(repo)
  }

  async getBySlug(slug: string): Promise<TenantResponse> {
    return this.repo.getBySlug(slug)
  }
}
