import { Injectable } from '@nestjs/common'

import { GlobalRole } from '@prisma/client'

import { CreateGlobalRoleDto } from './dtos/create-global-role.dto'
import { UpdateGlobalRoleDto } from './dtos/update-global-role.dto'
import { GlobalRoleRepository } from './global-role.repository'

@Injectable()
export class GlobalRoleService {
  constructor(private repo: GlobalRoleRepository) {}

  async getAll(): Promise<GlobalRole[]> {
    return this.repo.getAll()
  }

  async getById(id: string): Promise<GlobalRole> {
    return this.repo.getById(id)
  }

  async getByName(name: string): Promise<GlobalRole> {
    return this.repo.getByName(name)
  }

  async create(data: CreateGlobalRoleDto): Promise<GlobalRole> {
    return this.repo.create(data)
  }

  async update(id: string, data: UpdateGlobalRoleDto): Promise<GlobalRole> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
