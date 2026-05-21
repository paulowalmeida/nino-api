import { Module } from '@nestjs/common'

import { CommonModule } from '@shared/modules/common/common.module'

import { GlobalRoleController } from './global-role.controller'

@Module({
  imports: [CommonModule.forFeature('globalRole', 'Global Role')],
  controllers: [GlobalRoleController],
})
export class GlobalRoleModule {}
