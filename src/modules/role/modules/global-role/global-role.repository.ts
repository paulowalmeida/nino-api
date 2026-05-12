import { Injectable } from '@nestjs/common'

import { GlobalRole, Prisma } from '@prisma/client'

import { BaseRepository } from '@shared/repositories/base/base.repository'
import { ErrorService } from '@shared/services/error/error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { CreateGlobalRoleDto } from './dtos/create-global-role.dto'
import { UpdateGlobalRoleDto } from './dtos/update-global-role.dto'

@Injectable()
export class GlobalRoleRepository
  extends BaseRepository<Prisma.GlobalRoleDelegate> {
  constructor(
    prisma: PrismaService,
    errorService: ErrorService,
  ) {
    super(errorService, prisma.globalRole, 'Global Role')
  }

  async getAll(): Promise<GlobalRole[]> {
    return this.findAll<GlobalRole>({ orderBy: { name: 'asc' } })
  }

  async getById(id: string): Promise<GlobalRole> {
    return this.findItem<GlobalRole>({ where: { id } })
  }

  async getByName(name: string): Promise<GlobalRole> {
    return this.findItem<GlobalRole>({ where: { name } })
  }

  async create(data: CreateGlobalRoleDto): Promise<GlobalRole> {
    return this.insert<CreateGlobalRoleDto, GlobalRole>({ data })
  }

  async update(id: string, data: UpdateGlobalRoleDto): Promise<GlobalRole> {
    return this.updateItem<UpdateGlobalRoleDto, GlobalRole>({
      where: { id },
      data,
    })
  }

  async delete(id: string): Promise<{ message: string }> {
    return this.softDelete(id)
  }
}
