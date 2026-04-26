import {
  Injectable
} from '@nestjs/common'

import { CreateTenantStatusDto } from './dtos/create-tenant-status.dto'
import { UpdateTenantStatusDto } from './dtos/update-tenant-status.dto'
import { TenantStatusRepository } from './tenant-status.repository'
import { TenantStatus } from './types/tenant-status.type'

@Injectable()
export class TenantStatusService {
  constructor(private repo: TenantStatusRepository) {}

  async getAll(): Promise<TenantStatus[]> {
    return await this.repo.getAll()
  }

  async getById(id: string): Promise<TenantStatus> {
    return await this.repo.getById(id)
  }

  async create(data: CreateTenantStatusDto): Promise<TenantStatus> {
    return this.repo.create(data)
  }

  async update(id: string, data: UpdateTenantStatusDto): Promise<TenantStatus> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
