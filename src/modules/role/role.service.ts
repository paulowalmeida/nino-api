import { Injectable } from '@nestjs/common'

import { CreateRoleDto } from './dtos/create-role.dto'
import { UpdateRoleDto } from './dtos/update-role.dto'
import { Role } from './entities/role.entity'
import { RoleRepository } from './role.repository'

@Injectable()
export class RoleService {
  constructor(private repo: RoleRepository) {}

  async getAll(): Promise<Role[]> {
    return await this.repo.getAll()
  }

  async getById(id: string): Promise<Role> {
    return await this.repo.getById(id)
  }

  async getByName(name: string): Promise<Role> {
    return await this.repo.getByName(name)
  }

  async create(data: CreateRoleDto): Promise<Role> {
    return this.repo.create(data)
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    return this.repo.update(id, data)
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.repo.delete(id)
  }
}
