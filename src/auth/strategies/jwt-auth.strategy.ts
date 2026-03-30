import { AuthRepository } from '@auth/auth.repository'
import { UserTokenData } from '@auth/types/user/user-token.data.type'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authRepository: AuthRepository,
  ) {
    const jwtRequest = configService.get<string>('JWT_SECRET')
    if (!jwtRequest) {
      throw new Error(
        "JWT_SECRET don't be defined in the environment variables.",
      )
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtRequest,
      ignoreExpiration: false,
    })
  }

  async validate(payloadDecoded: UserTokenData): Promise<UserTokenData> {
    const user = await this.authRepository.findUserByEmail(payloadDecoded.email)

    if (!user) {
      throw new UnauthorizedException(
        'Token inválido ou usuário não existe mais.',
      )
    }

    return payloadDecoded
  }
}
