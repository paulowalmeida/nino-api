import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'

import { AuthService } from '@auth/auth.service'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto'
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard'
import { LoginResponse } from '@auth/types/login-response.type'
import { UserCreated } from '@auth/types/user/user-created.type'
import { UserFound } from '@auth/types/user/user-found.type'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import type { AuthRequest } from './types/user/user-auth-request.type'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('create-user')
  async createUser(@Body() payload: NewUserRequestDTO): Promise<UserCreated> {
    return await this.authService.createUser(payload)
  }

  @Get('current-user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: AuthRequest): Promise<UserFound> {
    const userFound = await this.authService.getCurrentUser(req.user.email)
    return userFound
  }

  @Post('login')
  async login(@Body() payload: LoginRequestDTO): Promise<LoginResponse> {
    return await this.authService.login(payload)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthRequest): Promise<{ message: string }> {
    await this.authService.logout(req.user.sub)
    return { message: 'Logout bem-sucedido' }
  }

  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() req) {
    return await this.authService.refreshToken(
      req.user.sub,
      req.user.refreshToken,
    )
  }
}
