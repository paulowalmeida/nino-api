import { Injectable } from '@nestjs/common'

import { RoleRepository } from './role.repository'
import { Role } from './types/role.type'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getAll(): Promise<Role[]> {
    return await this.roleRepository.findAll()
  }

  async getById(id: string): Promise<Role> {
    return await this.roleRepository.findById(id)
  }

  async getByCode(code: number): Promise<Role> {
    return await this.roleRepository.findByCode(code)
  }
}
