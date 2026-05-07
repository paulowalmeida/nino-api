import { Injectable } from '@nestjs/common'

import { TenantRole } from '@prisma/client'

import { CreateTenantRoleDto } from './dtos/create-tenant-role.dto'
import { UpdateTenantRoleDto } from './dtos/update-tenant-role.dto'
import { TenantRoleRepository } from './tenant-role.repository'

@Injectable()
export class TenantRoleService {
  constructor(private repo: TenantRoleRepository) {}

  async getAll(): Promise<TenantRole[]> {
    return this.repo.getAll()
  }

  async getById(id: string): Promise<TenantRole> {
    return this.repo.getById(id)
  }

  async getByName(name: string): Promise<TenantRole> {
    return this.repo.getByName(name)
  }

  async create(data: CreateTenantRoleDto): Promise<TenantRole> {
    return this.repo.create(data)
  }

  async update(id: string, data: UpdateTenantRoleDto): Promise<TenantRole> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
