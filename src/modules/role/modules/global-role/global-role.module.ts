import { Module } from '@nestjs/common'

import { ErrorService } from '@shared/services/error/error.service'

import { GlobalRoleController } from './global-role.controller'
import { GlobalRoleRepository } from './global-role.repository'
import { GlobalRoleService } from './global-role.service'

@Module({
  controllers: [GlobalRoleController],
  providers: [GlobalRoleService, GlobalRoleRepository, ErrorService],
  exports: [GlobalRoleService],
})
export class GlobalRoleModule {}
