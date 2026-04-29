import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common'

import type { Request, Response } from 'express'

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

  @Post('login')
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, tokens } = await this.authService.login(
      dto,
      req.ip,
      req.headers['user-agent'],
    )

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false, // Use false in localhost
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { user, accessToken: tokens.accessToken }
  }

  @Post('register')
  async register(@Body() dto: RegisterRequestDto) {
    return await this.authService.register(dto)
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = req.cookies['refreshToken']
    if (!token) throw new UnauthorizedException()

    const tokens = await this.authService.refresh(
      token,
      req.ip,
      req.headers['user-agent'],
    )

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    return { accessToken: tokens.accessToken }
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['refreshToken']
    if (token) await this.authService.logout(token)
    res.clearCookie('refreshToken')
    return { message: 'Logged out' }
  }
}
