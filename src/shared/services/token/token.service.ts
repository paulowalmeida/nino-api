import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { SignOptions } from 'jsonwebtoken'

import { AccountTokenData } from '@account/types/account-token.data.type'
import { Tokens } from '@auth/types/tokens.type'

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getTokens(account: AccountTokenData): Promise<Tokens> {
    const payload: AccountTokenData = {
      sub: account.sub,
      email: account.email,
      role: account.role || 0,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(payload, '15m', 'JWT_SECRET'),
      this.generateToken(payload, '7d', 'JWT_REFRESH_SECRET'),
    ])

    return { accessToken, refreshToken }
  }

  private generateToken(
    payload: AccountTokenData,
    expiresIn: SignOptions['expiresIn'],
    secretKey: string,
  ): Promise<string> {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>(secretKey),
      expiresIn,
    })
  }
}
