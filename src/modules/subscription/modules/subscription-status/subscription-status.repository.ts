import { Injectable } from '@nestjs/common'

import { Prisma, SubscriptionStatus } from '@prisma/client'

import type { IBaseLookupRepository } from '@shared/interfaces/base-lookup-repository.interface'
import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateSubscriptionStatusDto } from './dtos/create-subscription-status.dto'
import { UpdateSubscriptionStatusDto } from './dtos/update-subscription-status.dto'

@Injectable()
export class SubscriptionStatusRepository
  extends BaseRepository<Prisma.SubscriptionStatusDelegate>
  implements IBaseLookupRepository<
    SubscriptionStatus,
    CreateSubscriptionStatusDto,
    UpdateSubscriptionStatusDto
  > {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.subscriptionStatus, 'Subscription Status')
  }

  async getAll(): Promise<SubscriptionStatus[]> {
    return this.findAll<SubscriptionStatus>({ orderBy: { name: 'asc' } })
  }

  async getById(id: string): Promise<SubscriptionStatus> {
    return this.findItem<SubscriptionStatus>({ where: { id } })
  }

  async create(
    data: CreateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    return this.insert<CreateSubscriptionStatusDto, SubscriptionStatus>({ data })
  }

  async update(
    id: string,
    data: UpdateSubscriptionStatusDto,
  ): Promise<SubscriptionStatus> {
    return this.updateItem<UpdateSubscriptionStatusDto, SubscriptionStatus>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
