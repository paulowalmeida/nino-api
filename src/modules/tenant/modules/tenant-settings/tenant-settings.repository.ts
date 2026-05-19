import { Injectable } from '@nestjs/common'

import { Prisma, TenantSettings } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { UpsertTenantSettingsDto } from './dtos/upsert-tenant-settings.dto'

@Injectable()
export class TenantSettingsRepository
  extends BaseRepository<Prisma.TenantSettingsDelegate> {
  constructor(prisma: PrismaService, errorService: ErrorService) {
    super(errorService, prisma.tenantSettings, 'Tenant Settings')
  }

  async getByTenantId(tenantId: string): Promise<TenantSettings> {
    return this.findItem<TenantSettings>({ where: { tenantId } })
  }

  async upsert(
    tenantId: string,
    data: UpsertTenantSettingsDto,
  ): Promise<TenantSettings> {
    const existing = await this.findItem<TenantSettings>({
      where: { tenantId },
    }).catch(() => null)

    if (existing) {
      return this.updateItem<UpsertTenantSettingsDto, TenantSettings>({
        where: { tenantId },
        data,
      })
    }

    return this.insert<UpsertTenantSettingsDto & { tenantId: string }, TenantSettings>({
      data: { tenantId, ...data },
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
