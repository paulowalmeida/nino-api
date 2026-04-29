import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { Role } from './entities/role.entity'
import { RoleController } from './role.controller'
import { RoleRepository } from './role.repository'
import { RoleService } from './role.service'

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  controllers: [RoleController],
  providers: [RoleService, RoleRepository, ErrorService],
  exports: [RoleService],
})
export class RoleModule {}
