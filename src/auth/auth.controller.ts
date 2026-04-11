import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewAccountRequestDTO } from '@auth/dtos/new-account-request.dto'
import { JwtRefreshGuard } from '@auth/jwt-refresh.guard'
import { AuthService } from '@auth/services/auth.service'
import type { AuthRequest } from '@auth/types/account/account-auth-request.type'
import { Account } from '@auth/types/account/account.type'
import { LoginResponse } from '@auth/types/login-response.type'
import { Tokens } from '@auth/types/tokens.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @Post('create-account')
  async createAccount(@Body() payload: NewAccountRequestDTO): Promise<Account> {
    return await this.authService.createAccount(payload)
  }

  @Get('current-account')
  @UseGuards(JwtAuthGuard)
  async getCurrentAccount(@Req() req: AuthRequest): Promise<Account> {
    console.log(req.account)
    return await this.authService.getAccount(req.account.email)
  }

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
    console.log(req.account)
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
