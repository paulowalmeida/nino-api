import { Injectable } from '@nestjs/common'

import { Role } from '@role/types/role.type'
import { RoleRepository } from './role.repository'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getAll(): Promise<Role[]> {
    return await this.roleRepository.findAll()
  }

  async getById(id: number): Promise<Role> {
    return await this.roleRepository.findById(id)
  }
}
