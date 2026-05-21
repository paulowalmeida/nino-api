import { Injectable } from '@nestjs/common'

import { CredentialInfo } from '@credential/types/credential-info.type'

import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import { UserTenantFull } from './types/user-tenant-full.type'
import { UserTenantPaginatedResponse } from './types/user-tenant-paginated-response.type'
import { UserTenantResponse } from './types/user-tenant.response.type'
import { UserTenantRepository } from './user-tenant.repository'

@Injectable()
export class UserTenantService {
  private readonly include = {
    tenantRole: true,
    user: { include: { globalRole: true, credentials: true } },
  } as const

  constructor(private readonly repo: UserTenantRepository) {}

  private toResponse(item: UserTenantFull): UserTenantResponse {
    const { userId: _, tenantRoleId: _r, tenantRole, user, ...rest } = item
    const {
      deletedAt: _d,
      globalRoleId: _ur,
      globalRole: role,
      credentials: rawCredentials,
      ...userRest
    } = user
    const credentials = rawCredentials.map(
      ({ password: _p, deletedAt: _cd, ...c }) => c,
    ) as CredentialInfo[]
    return { ...rest, tenantRole, user: { ...userRest, role, credentials } }
  }

  async create(data: CreateUserTenantDto): Promise<UserTenantResponse> {
    const saved = await this.repo.insert<CreateUserTenantDto, UserTenantFull>({
      data,
      include: this.include,
    })
    return this.toResponse(saved)
  }

  async getByUserId(
    userId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    const result = await this.repo.findAllPaginated<UserTenantFull>({
      page: query.page,
      size: query.size,
      where: { userId },
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async getByTenantId(
    tenantId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    const result = await this.repo.findAllPaginated<UserTenantFull>({
      page: query.page,
      size: query.size,
      where: { tenantId },
      order: {
        target: query.target ?? 'createdAt',
        direction: query.direction ?? 'asc',
      },
      include: this.include,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async delete(userId: string, tenantId: string): Promise<{ message: string }> {
    return this.repo.softDelete({ userId_tenantId: { userId, tenantId } })
  }
}
