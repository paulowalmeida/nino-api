import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import type { Request } from 'express'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import type { AuthRequest } from '@shared/types/auth-request.type'
import { UserResponse } from '@user/types/user-response.type'
import { AuthService } from './auth.service'
import { LoginRequestDto } from './dtos/login-request.dto'
import { RegisterRequestDto } from './dtos/register-request.dto'
import { LoginResponse } from './types/login-response.type'
import { Tokens } from './types/tokens.type'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthRequest): Promise<UserResponse> {
    return await this.authService.me(req.user.sub)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
  ): Promise<LoginResponse> {
    return await this.authService.login(dto, req.ip, req.headers['user-agent'])
  }

  @Post('register')
  async register(
    @Body() dto: RegisterRequestDto,
  ): Promise<UserResponse> {
    return await this.authService.register(dto)
  }

  @Post('refresh')
  async refresh(
    @Headers('authorization') auth: string | undefined,
    @Req() req: Request,
  ): Promise<{ tokens: Tokens }> {
    const token = auth?.replace('Bearer ', '')
    if (!token) throw new UnauthorizedException()

    const tokens = await this.authService.refresh(
      token,
      req.ip,
      req.headers['user-agent'],
    )

    return { tokens }
  }

  @Post('logout')
  async logout(
    @Headers('authorization') auth: string | undefined,
  ): Promise<{ message: string }> {
    const token = auth?.replace('Bearer ', '')
    if (token) await this.authService.logout(token)
    return { message: 'Logged out' }
  }
}
