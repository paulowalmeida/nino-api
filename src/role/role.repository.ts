import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { Role } from './types/role.type'

@Injectable()
export class RoleRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async findAll(): Promise<Role[]> {
    try {
      return await this.prisma.role.findMany()
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findById(id: string): Promise<Role> {
    try {
      const role = await this.prisma.role.findUnique({
        where: { id },
      })

      if (!role) throw new NotFoundException('Role not found')

      return role
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async findByCode(code: number): Promise<Role> {
    try {
      const role = await this.prisma.role.findUnique({
        where: { code },
      })

      if (!role) throw new NotFoundException('Role not found')

      return role
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
