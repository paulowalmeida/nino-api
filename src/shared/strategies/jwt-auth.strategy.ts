import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'

import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { AccountRepository } from '@account/account.repository'
import { AccountTokenData } from '@account/types/account-token.data.type'

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly accountRepository: AccountRepository,
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
    const account = await this.accountRepository.findByEmail(
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
