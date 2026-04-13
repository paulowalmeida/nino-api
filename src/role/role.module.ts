import { Module } from '@nestjs/common'

import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'
import { RoleController } from './role.controller'
import { RoleRepository } from './role.repository'
import { RoleService } from './role.service'

@Module({
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, PrismaService, PrismaErrorService],
  exports: [RoleService],
})
export class RoleModule {}
