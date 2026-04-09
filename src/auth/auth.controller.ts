import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'

import { AuthService } from '@auth/auth.service'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { UserRegisterRequestDTO } from '@auth/dtos/user-register-request.dto'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { LoginResponse } from '@auth/types/login-response.type'
import { UserCreated } from '@auth/types/user/user-created.type'
import { UserFound } from '@auth/types/user/user-found.type'
import { ChangePasswordRequestDTO } from './dtos/change-password-request.dto'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import type { AuthRequest } from './types/user/user-auth-request.type'
import { Throttle } from '@nestjs/throttler'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @Post('create-user')
  async createUser(
    @Body() payload: UserRegisterRequestDTO,
  ): Promise<UserCreated> {
    return await this.authService.createUser(payload)
  }

  @Get('current-user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Req() req: AuthRequest): Promise<UserFound> {
    const userFound = await this.authService.getUser(req.user.email)
    return userFound
  }

  @Throttle({ default: { ttl: 60000, limit: 5 } })
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

  @Throttle({ default: { ttl: 6000, limit: 10 } })
  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() req) {
    return await this.authService.refreshToken(
      req.user.sub,
      req.user.refreshToken,
    )
  }

  @Throttle({ default: { ttl: 6000, limit: 3 } })
  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthRequest,
    @Body() body: ChangePasswordRequestDTO,
  ): Promise<{ message: string }> {
    return await this.authService.changePassword(req, body)
  }
}
