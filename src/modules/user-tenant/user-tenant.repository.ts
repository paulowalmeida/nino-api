import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { Credential } from '@credential/entities/credential.entity'
import { UserTenant } from '@user/entities/user-tenant.entity'
import { CreateUserTenantDto } from './dtos/create-user-tenant.dto'
import { UserTenantResponse } from './types/user-tenant.response.type'

@Injectable()
export class UserTenantRepository {
  constructor(
    @InjectRepository(UserTenant)
    private readonly repository: Repository<UserTenant>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly errorService: ErrorService,
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

  async getByUserId(userId: string): Promise<UserTenantResponse[]> {
    try {
      const items = await this.repository.find({
        where: { userId },
        relations: ['user', 'user.role'],
      })
      return Promise.all(
        items.map(async ({ userId: _, user, ...rest }) => ({
          ...rest,
          user: await this.mapUser(user),
        })),
      )
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByTenantId(tenantId: string): Promise<UserTenantResponse[]> {
    try {
      const items = await this.repository.find({
        where: { tenantId },
        relations: ['user', 'user.role'],
      })
      return Promise.all(
        items.map(async ({ userId: _, user, ...rest }) => ({
          ...rest,
          user: await this.mapUser(user),
        })),
      )
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
