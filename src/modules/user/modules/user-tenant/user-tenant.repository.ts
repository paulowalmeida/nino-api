import { Injectable } from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { CredentialInfo } from '@credential/types/credential-info.type'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import { UserTenantFull } from './types/user-tenant-full.type'
import { UserTenantOrderBy } from './types/user-tenant-order-by.type'
import { UserTenantPaginatedResponse } from './types/user-tenant-paginated-response.type'
import { UserTenantResponse } from './types/user-tenant.response.type'

@Injectable()
export class UserTenantRepository
  extends BaseRepository<Prisma.UserTenantDelegate> {
  private readonly ITEM_INCLUDE = {
    tenantRole: true,
    user: { include: { globalRole: true, credentials: true } },
  } as const

  constructor(
    prisma: PrismaService,
    paginationService: PaginationService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.userTenant, 'User Tenant', paginationService)
  }

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
    const saved = await this.insert<CreateUserTenantDto, UserTenantFull>({
      data,
      include: this.ITEM_INCLUDE,
    })
    return this.toResponse(saved)
  }

  async getByUserId(
    userId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    const orderBy = query.orderBy ?? UserTenantOrderBy.CREATED_AT
    const result = await this.findAllPaginated<UserTenantFull>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      where: { userId },
      orderBy: {
        [orderBy]: query.orderDir?.toLowerCase() ?? 'asc',
      } as Prisma.UserTenantOrderByWithRelationInput,
      include: this.ITEM_INCLUDE,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async getByTenantId(
    tenantId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    const orderBy = query.orderBy ?? UserTenantOrderBy.CREATED_AT
    const result = await this.findAllPaginated<UserTenantFull>({
      page: query.page ?? 1,
      size: query.size ?? 10,
      where: { tenantId },
      orderBy: {
        [orderBy]: query.orderDir?.toLowerCase() ?? 'asc',
      } as Prisma.UserTenantOrderByWithRelationInput,
      include: this.ITEM_INCLUDE,
      ignoreDeleted: true,
    })
    return { ...result, data: result.data.map((i) => this.toResponse(i)) }
  }

  async delete(userId: string, tenantId: string): Promise<{ message: string }> {
    return this.updateItem<{ deletedAt: Date }, { message: string }>({
      where: { userId_tenantId: { userId, tenantId } },
      data: { deletedAt: new Date() },
    }).then(() => ({ message: 'Deleted successfully' }))
  }
}
