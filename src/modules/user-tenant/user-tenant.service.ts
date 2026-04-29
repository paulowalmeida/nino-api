import { Injectable } from '@nestjs/common'

import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantRepository } from './user-tenant.repository'
import { UserTenantResponse } from './types/user-tenant.response.type'

@Injectable()
export class UserTenantService {
  constructor(private readonly repo: UserTenantRepository) {}

  async create(data: CreateUserTenantDto): Promise<UserTenantResponse> {
    return this.repo.create(data)
  }

  async getByUserId(userId: string): Promise<UserTenantResponse[]> {
    return this.repo.getByUserId(userId)
  }

  async getByTenantId(tenantId: string): Promise<UserTenantResponse[]> {
    return this.repo.getByTenantId(tenantId)
  }

  async delete(userId: string, tenantId: string): Promise<{ message: string }> {
    return this.repo.delete(userId, tenantId)
  }
}
