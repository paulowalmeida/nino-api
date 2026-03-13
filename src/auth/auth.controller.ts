import { Body, Controller, Post } from '@nestjs/common'

import { AuthService } from '@auth/auth.service'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto'
import { LoginResponse } from '@auth/types/login-response.type'
import { UserCreated } from '@auth/types/user/user-created.respository.type'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() payload: LoginRequestDTO): Promise<LoginResponse> {
    return await this.authService.login(payload)
  }

  @Post('create-user')
  async createUser(
    @Body() payload: NewUserRequestDTO
  ): Promise<UserCreated> {
    return await this.authService.createUser(payload)
  }
}
