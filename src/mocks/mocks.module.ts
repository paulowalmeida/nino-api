import { Module } from '@nestjs/common'

import { CnpjMockController } from './cnpj/cnpj.mock.controller'
import { CnpjMockService } from './cnpj/cnpj.mock.service'
import { UserMockController } from './user/user.mock.controller'
import { UserMockService } from './user/user.mock.service'

@Module({
  controllers: [UserMockController, CnpjMockController],
  providers: [UserMockService, CnpjMockService],
})
export class MocksModule {}
