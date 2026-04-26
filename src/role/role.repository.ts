import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { Role } from '@role/types/role.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateRoleDto } from './dtos/create-role.dto'
import { UpdateRoleDto } from './dtos/update-role.dto'

@Injectable()
export class RoleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async getAll(): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany({
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<Role> {
    try {
      const found = await this.prisma.role.findUnique({
        where: { id },
      })

      if (!found) throw new NotFoundException('Role not found')

      return found
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async create(data: CreateRoleDto): Promise<Role> {
    try {
      const existsByName = await this.prisma.role.findUnique({
        where: { name: data.name },
      })
      if (existsByName) throw new ConflictException('Name already exists')

      return await this.prisma.role.create({ data })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    try {
      if (data.name) {
        const found = await this.prisma.role.findUnique({
          where: { name: data.name },
        })

        if (found && found.id !== id) {
          throw new ConflictException('Name already exists')
        }
      }

      return await this.prisma.role.update({
        where: { id },
        data,
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.prisma.role.delete({ where: { id } })
      return { message: 'Role deleted successfully' }
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
