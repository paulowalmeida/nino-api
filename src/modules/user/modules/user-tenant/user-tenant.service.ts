import { Injectable } from '@nestjs/common'

import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import {
  UserTenantPaginatedResponse,
} from './types/user-tenant-paginated-response.type'
import { UserTenantResponse } from './types/user-tenant.response.type'
import { UserTenantRepository } from './user-tenant.repository'

@Injectable()
export class UserTenantService {
  constructor(private readonly repo: UserTenantRepository) {}

  async create(data: CreateUserTenantDto): Promise<UserTenantResponse> {
    return this.repo.create(data)
  }

  async getByUserId(
    userId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    return this.repo.getByUserId(userId, query)
  }

  async getByTenantId(
    tenantId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    return this.repo.getByTenantId(tenantId, query)
  }

  async delete(userId: string, tenantId: string): Promise<{ message: string }> {
    return this.repo.delete(userId, tenantId)
  }
}
