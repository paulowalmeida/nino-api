import { Injectable, NotFoundException } from '@nestjs/common'

import { Role } from '@role/types/role.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

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

  async findById(id: number): Promise<Role> {
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
}
