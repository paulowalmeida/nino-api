import { AuthRepository } from '@auth/auth.repository'
import { AccountTokenData } from 'src/account/types/account-token.data.type'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'

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
      passReqToCallback: true,
    })
  }

  async validate(
    req: Request,
    payloadDecoded: AccountTokenData,
  ): Promise<AccountTokenData> {
    const account = await this.authRepository.findAccountByEmail(
      payloadDecoded.email,
    )

    if (!account) {
      throw new UnauthorizedException(
        'Token inválido ou usuário não existe mais.',
      )
    }
    
    req['account'] = payloadDecoded
    return payloadDecoded
  }
}
