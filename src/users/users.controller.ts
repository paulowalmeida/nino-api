import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { Controller, Get, UseGuards } from '@nestjs/common'

@Controller('users')
export class UsersController {
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getMe() {}
}
