import { Module } from '@nestjs/common'

import { PrismaService } from '@shared/services/prisma/prisma.service'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { RoleService } from './role.service'
import { RoleRepository } from './role.repository'
import { RoleController } from './role.controller'

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, PrismaService, PrismaErrorService],
  exports: [RoleService],
})
export class RoleModule {}
