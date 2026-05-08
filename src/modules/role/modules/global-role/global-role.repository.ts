import { ConflictException, Injectable } from '@nestjs/common'

import { GlobalRole } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateGlobalRoleDto } from './dtos/create-global-role.dto'
import { UpdateGlobalRoleDto } from './dtos/update-global-role.dto'

@Injectable()
export class GlobalRoleRepository extends BaseRepository {
  constructor(
    private readonly prisma: PrismaService,
    errorService: ErrorService,
  ) {
    super(errorService)
  }

  async getAll(): Promise<GlobalRole[]> {
    return await this.findMany<GlobalRole[]>(this.prisma.globalRole)
  }

  async getById(id: string): Promise<GlobalRole> {
    return await this.getFirst<GlobalRole, string>(
      this.prisma.globalRole,
      'id',
      id,
    )
  }

  async getByName(name: string): Promise<GlobalRole> {
    return await this.getFirst<GlobalRole, string>(
      this.prisma.globalRole,
      'name',
      name,
    )
  }

  async create(data: CreateGlobalRoleDto): Promise<GlobalRole> {
    return await this.insert<CreateGlobalRoleDto, GlobalRole>(
      this.prisma.globalRole,
      data,
    )
  }

  async update(id: string, data: UpdateGlobalRoleDto): Promise<GlobalRole> {
    return this.executeFnWithTryCatch(async () => {
      const role = await this.getById(id)
      if (data.name && data.name !== role.name) {
        const exists = await this.prisma.globalRole.findFirst({
          where: { name: data.name, deletedAt: null },
        })
        if (exists) throw new ConflictException('Name already exists')
      }
      return await this.prisma.globalRole.update({ where: { id }, data })
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(this.prisma.globalRole, id)
  }
}
