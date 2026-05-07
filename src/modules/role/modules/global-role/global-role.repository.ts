import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'

import { GlobalRole } from '@prisma/client'

import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateGlobalRoleDto } from './dtos/create-global-role.dto'
import { UpdateGlobalRoleDto } from './dtos/update-global-role.dto'

@Injectable()
export class GlobalRoleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly errorService: ErrorService,
  ) {}

  async getAll(): Promise<GlobalRole[]> {
    try {
      return await this.prisma.globalRole.findMany({
        where: { deletedAt: null },
        orderBy: { name: 'asc' },
      })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<GlobalRole> {
    try {
      const found = await this.prisma.globalRole.findFirst({
        where: { id, deletedAt: null },
      })
      if (!found) throw new NotFoundException('GlobalRole not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByName(name: string): Promise<GlobalRole> {
    try {
      const found = await this.prisma.globalRole.findFirst({
        where: { name, deletedAt: null },
      })
      if (!found) throw new NotFoundException('GlobalRole not found')
      return found
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async create(data: CreateGlobalRoleDto): Promise<GlobalRole> {
    try {
      const exists = await this.prisma.globalRole.findFirst({
        where: { name: data.name, deletedAt: null },
      })
      if (exists) throw new ConflictException('Name already exists')
      return await this.prisma.globalRole.create({ data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateGlobalRoleDto): Promise<GlobalRole> {
    try {
      const role = await this.getById(id)
      if (data.name && data.name !== role.name) {
        const exists = await this.prisma.globalRole.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.globalRole.update({ where: { id }, data })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.prisma.globalRole.update({
        where: { id },
        data: { deletedAt: new Date() },
      })
      return { message: 'GlobalRole deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
