import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AccountTokenData } from '@account/types/account-token.data.type'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly configService: ConfigService) {
    const jwtRefresh = configService.get<string>('JWT_REFRESH_SECRET')
    if (!jwtRefresh) {
      throw new Error(
        "JWT_REFRESH_SECRET don't be defined in the environment variables.",
      )
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtRefresh,
      ignoreExpiration: false,
      passReqToCallback: true,
    })
  }

  async validate(
    req: Request,
    payload: AccountTokenData,
  ): Promise<AccountTokenData> {
    const hashedRefreshToken =
      req.headers.authorization?.replace('Bearer ', '') ?? ''
    const data = { ...payload, hashedRefreshToken }
    req['account'] = data
    return data
  }
}
