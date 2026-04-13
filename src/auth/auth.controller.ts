import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { JwtRefreshGuard } from '@auth/jwt-refresh.guard'
import { AuthService } from '@auth/auth.service'
import { LoginResponse } from '@auth/types/login-response.type'
import { Tokens } from '@auth/types/tokens.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import type { AuthRequest } from '@shared/types/account-auth-request.type'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 60000, limit: 5 } })
  @Post('login')
  async login(@Body() payload: LoginRequestDTO): Promise<LoginResponse> {
    return await this.authService.login(payload)
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthRequest): Promise<{ message: string }> {
    await this.authService.logout(req.account.sub)
    return { message: 'Logout bem-sucedido' }
  }

  @Throttle({ default: { ttl: 6000, limit: 10 } })
  @Post('refresh-token')
  @UseGuards(JwtRefreshGuard)
  async refreshToken(@Req() req: AuthRequest): Promise<Tokens> {
    return await this.authService.refreshToken(
      req.account.sub,
      req.account?.hashedRefreshToken,
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
