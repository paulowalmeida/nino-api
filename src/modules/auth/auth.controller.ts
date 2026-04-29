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
import { AuthService } from './auth.service'
import { LoginRequestDto } from './dtos/login-request.dto'
import { RegisterRequestDto } from './dtos/register-request.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: AuthRequest) {
    return await this.authService.me(req.user.sub)
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
  ) {
    const { user, tokens } = await this.authService.login(
      dto,
      req.ip,
      req.headers['user-agent'],
    )

    return { user, tokens }
  }

  @Post('register')
  async register(@Body() dto: RegisterRequestDto) {
    return await this.authService.register(dto)
  }

  @Post('refresh')
  async refresh(@Headers('authorization') auth: string, @Req() req: Request) {
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
  async logout(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '')
    if (token) await this.authService.logout(token)
    return { message: 'Logged out' }
  }
}
