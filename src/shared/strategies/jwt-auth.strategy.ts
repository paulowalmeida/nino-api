import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { UserTokenData } from '@user/types/user-token.data.type'
import { UserRepository } from '@user/user.repository'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
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
      passReqToCallback: true,
    })
  }

  async validate(
    req: Request,
    payloadDecoded: UserTokenData,
  ): Promise<UserTokenData> {
    const user = await this.userRepository.getById(payloadDecoded.sub)

    if (!user) {
      throw new UnauthorizedException(
        'Token inválido ou usuário não existe mais.',
      )
    }

    return payloadDecoded
  }
}
