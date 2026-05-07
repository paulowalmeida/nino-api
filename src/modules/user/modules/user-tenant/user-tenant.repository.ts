import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { Prisma } from '@prisma/client'

import { CredentialInfo } from '@credential/types/credential-info.type'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { ErrorService } from '@shared/services/error/error.service'
import {
  PaginationService,
} from '@shared/services/pagination/pagination.service'
import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import { UserTenantFull } from './types/user-tenant-full.type'
import { UserTenantOrderBy } from './types/user-tenant-order-by.type'
import {
  UserTenantPaginatedResponse,
} from './types/user-tenant-paginated-response.type'
import { UserTenantResponse } from './types/user-tenant.response.type'

@Injectable()
export class UserTenantRepository {
  private readonly USER_INCLUDE = {
    globalRole: true,
    credentials: true,
  } as const

  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

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
    try {
      const exists = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: data.userId,
            tenantId: data.tenantId,
          },
        },
      })

      if (exists)
        throw new ConflictException('User is already linked to this tenant')

      const saved = await this.prisma.userTenant.create({
        data,
        include: {
          tenantRole: true,
          user: { include: this.USER_INCLUDE },
        },
      }) as UserTenantFull

      return this.toResponse(saved)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByUserId(
    userId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    try {
      const params = this.paginationService.getPaginationParams(query)
      const orderBy = query.orderBy ?? UserTenantOrderBy.CREATED_AT
      const [items, total] = await Promise.all([
        this.prisma.userTenant.findMany({
          where: { userId },
          orderBy: {
            [orderBy]: query.orderDir?.toLowerCase() ?? 'asc',
          } as Prisma.UserTenantOrderByWithRelationInput,
          include: {
            tenantRole: true,
            user: { include: this.USER_INCLUDE },
          },
          skip: params.skip,
          take: params.take,
        }),
        this.prisma.userTenant.count({ where: { userId } }),
      ])
      const data = (items as UserTenantFull[]).map((i) => this.toResponse(i))
      return this.paginationService.paginate(data, total, query)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByTenantId(
    tenantId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    try {
      const params = this.paginationService.getPaginationParams(query)
      const orderBy = query.orderBy ?? UserTenantOrderBy.CREATED_AT
      const [items, total] = await Promise.all([
        this.prisma.userTenant.findMany({
          where: { tenantId },
          orderBy: {
            [orderBy]: query.orderDir?.toLowerCase() ?? 'asc',
          } as Prisma.UserTenantOrderByWithRelationInput,
          include: {
            tenantRole: true,
            user: { include: this.USER_INCLUDE },
          },
          skip: params.skip,
          take: params.take,
        }),
        this.prisma.userTenant.count({ where: { tenantId } }),
      ])
      const data = (items as UserTenantFull[]).map((i) => this.toResponse(i))
      return this.paginationService.paginate(data, total, query)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(userId: string, tenantId: string): Promise<{ message: string }> {
    try {
      const found = await this.prisma.userTenant.findUnique({
        where: { userId_tenantId: { userId, tenantId } },
      })
      if (!found) throw new NotFoundException('UserTenant link not found')
      await this.prisma.userTenant.delete({
        where: { userId_tenantId: { userId, tenantId } },
      })
      return { message: 'UserTenant link removed successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
