import { Inject, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'

import { UserTokenData } from '@user/types/user-token.data.type'
import { RefreshRequest } from './types/refresh-request.type'

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    @Inject(ConfigService) configService: Pick<ConfigService, 'get'>,
  ) {
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

  validate(req: RefreshRequest, payload: UserTokenData): UserTokenData {
    const hashedRefreshToken =
      req.headers.authorization?.replace('Bearer ', '') ?? ''
    const data = { ...payload, hashedRefreshToken }
    req['user'] = data
    return data
  }
}
