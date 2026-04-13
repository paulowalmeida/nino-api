import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { SignOptions } from 'jsonwebtoken'

import { Tokens } from '@auth/types/tokens.type'
import { UserTokenData } from '@user/types/user-token.data.type'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getTokens(user: UserTokenData): Promise<Tokens> {
    const payload: UserTokenData = {
      sub: user.sub,
      email: user.email,
      role: user.role || 0,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, '15m', 'JWT_SECRET'),
      this.generateToken(payload, '7d', 'JWT_REFRESH_SECRET'),
    ])

    return { accessToken, refreshToken }
  }

  private generateToken(
    payload: UserTokenData,
    expiresIn: SignOptions['expiresIn'],
    secretKey: string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(secretKey),
      expiresIn,
    })
  }
}
