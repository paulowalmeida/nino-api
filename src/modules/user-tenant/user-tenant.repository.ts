import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { Credential } from '@credential/entities/credential.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { UserTenant } from '@user/entities/user-tenant.entity'
import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantQueryDto } from './dtos/user-tenant-query.dto'
import { UserTenantOrderBy } from './types/user-tenant-order-by.type'
import { UserTenantPaginatedResponse } from './types/user-tenant-paginated-response.type'
import { UserTenantResponse } from './types/user-tenant.response.type'

@Injectable()
export class UserTenantRepository {
  constructor(
    @InjectRepository(UserTenant)
    private readonly repository: Repository<UserTenant>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

  private async fetchCredentials(userId: string) {
    const items = await this.credentialRepository.find({ where: { userId } })
    return items.map(({ password: _, ...c }) => c)
  }

  private async mapUser(user: any) {
    return {
      ...user,
      credentials: await this.fetchCredentials(user.id),
    }
  }

  async create(data: CreateUserTenantDto): Promise<UserTenantResponse> {
    try {
      const exists = await this.repository.findOneBy({
        userId: data.userId,
        tenantId: data.tenantId,
      })

      if (exists) {
        throw new ConflictException('User is already linked to this tenant')
      }

      const saved = await this.repository.save(this.repository.create(data))

      const userTenant = await this.repository.findOne({
        where: { userId: saved.userId, tenantId: saved.tenantId },
        relations: ['user', 'user.role'],
      })

      if (!userTenant) throw new NotFoundException('User tenant not found')

      const { userId: _, user, ...rest } = userTenant
      return { ...rest, user: await this.mapUser(user) }
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByUserId(
    userId: string,
    query: UserTenantQueryDto,
  ): Promise<UserTenantPaginatedResponse> {
    try {
      const [items, total] = await this.repository.findAndCount({
        where: { userId },
        order: {
          [query.orderBy ?? UserTenantOrderBy.CREATED_AT]:
            query.orderDir ?? 'ASC',
        },
        relations: ['user', 'user.role'],
        ...this.paginationService.getPaginationParams(query),
      })
      const data = await Promise.all(
        items.map(async ({ userId: _, user, ...rest }) => ({
          ...rest,
          user: await this.mapUser(user),
        })),
      )
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
      const [items, total] = await this.repository.findAndCount({
        where: { tenantId },
        order: {
          [query.orderBy ?? UserTenantOrderBy.CREATED_AT]:
            query.orderDir ?? 'ASC',
        },
        relations: ['user', 'user.role'],
        ...this.paginationService.getPaginationParams(query),
      })
      const data = await Promise.all(
        items.map(async ({ userId: _, user, ...rest }) => ({
          ...rest,
          user: await this.mapUser(user),
        })),
      )
      return this.paginationService.paginate(data, total, query)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(userId: string, tenantId: string): Promise<{ message: string }> {
    try {
      const found = await this.repository.findOneBy({ userId, tenantId })
      if (!found) throw new NotFoundException('UserTenant link not found')

      await this.repository.delete({ userId, tenantId })
      return { message: 'UserTenant link removed successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
