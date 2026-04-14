import { Controller, Get, Param } from '@nestjs/common'
import { UserMockService } from './user.mock.service'

@Controller('mock/users')
export class UserMockController {
  constructor(private readonly userMockService: UserMockService) {}

  // Rota: GET /mock/users
  @Get()
  getSingleUser() {
    return this.userMockService.getOneMock()
  }

  // Rota: GET /mock/users/massive?count=500
  @Get('/:quantity')
  getMassiveUsers(@Param('quantity') quantity: number) {
    return this.userMockService.getManyMocks(quantity)
  }
}
