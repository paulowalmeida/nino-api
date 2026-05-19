import { Injectable } from '@nestjs/common'

import { TenantSettings } from '@prisma/client'

import { UpsertTenantSettingsDto } from './dtos/upsert-tenant-settings.dto'
import { TenantSettingsRepository } from './tenant-settings.repository'

@Injectable()
export class TenantSettingsService {
  constructor(private readonly repo: TenantSettingsRepository) {}

  async getByTenantId(tenantId: string): Promise<TenantSettings> {
    return this.repo.getByTenantId(tenantId)
  }

  async upsert(
    tenantId: string,
    data: UpsertTenantSettingsDto,
  ): Promise<TenantSettings> {
    return this.repo.upsert(tenantId, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
