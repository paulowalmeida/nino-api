import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Role } from '@role/entities/role.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateRoleDto } from './dtos/create-role.dto'
import { UpdateRoleDto } from './dtos/update-role.dto'

@Injectable()
export class RoleRepository {
  constructor(
    @InjectRepository(Role)
    private readonly repository: Repository<Role>,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<Role[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<Role> {
    try {
      const found = await this.repository.findOneBy({ id })
      if (!found) throw new NotFoundException('Role not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateRoleDto): Promise<Role> {
    try {
      const exists = await this.repository.findOneBy({ name: data.name })
      if (exists) throw new ConflictException('Name already exists')

      const role = this.repository.create(data)
      return await this.repository.save(role)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    try {
      const role = await this.getById(id)

      if (data.name && data.name !== role.name) {
        const exists = await this.repository.findOneBy({ name: data.name })
        if (exists) throw new ConflictException('Name already exists')
      }

      Object.assign(role, data)
      return await this.repository.save(role)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
      return { message: 'Role deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
