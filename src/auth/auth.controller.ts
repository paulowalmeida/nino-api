import { Body, Controller, Post } from '@nestjs/common';

import { AuthService } from '@auth/auth.service';
import { LoginRequestDTO } from '@auth/dtos/login-request.dto';
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto';
import { UserCreated } from '@auth/types/user/user-created.type';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  async login(@Body() payload: LoginRequestDTO) {
    return await this.authService.login(payload);
  }

  @Post('new-user')
  async newUser(
    @Body() payload: NewUserRequestDTO
  ): Promise<UserCreated> {
    return await this.authService.newUser(payload);
  }

}
