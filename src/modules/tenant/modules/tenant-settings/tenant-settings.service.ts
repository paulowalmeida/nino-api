import { Injectable } from '@nestjs/common'

import { TenantSettings } from '@prisma/client'

import { UpsertTenantSettingsDto } from './dtos/upsert-tenant-settings.dto'
import { TenantSettingsRepository } from './tenant-settings.repository'

@Injectable()
export class TenantSettingsService {
  constructor(private readonly repo: TenantSettingsRepository) {}

  async getByTenantId(tenantId: string): Promise<TenantSettings> {
    return this.repo.findItem<TenantSettings>({ where: { tenantId } })
  }

  async upsert(
    tenantId: string,
    data: UpsertTenantSettingsDto,
  ): Promise<TenantSettings> {
    const exists = await this.repo.exists({ where: { tenantId } })
    if (exists) {
      return this.repo.updateItem<UpsertTenantSettingsDto, TenantSettings>({
        where: { tenantId },
        data,
      })
    }
    return this.repo.insert<
      UpsertTenantSettingsDto & { tenantId: string },
      TenantSettings
    >({ data: { tenantId, ...data } })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.softDelete({ id })
  }
}
