import { Tokens } from '@auth/types/tokens.type'
import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import { UserTokenData } from '@user/types/user-token.data.type'

/**
 * Handles JWT token generation and verification.
 * Access token expires in 15 minutes; refresh token in 7 days.
 * Secrets are read from environment via `ConfigService` (`JWT_SECRET`,
 * `JWT_REFRESH_SECRET`) — missing secrets will cause silent signing failures,
 * so ensure both vars are set in every environment.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Signs access and refresh tokens in parallel from the same payload.
   * @param payload - User identity data embedded in the token (`UserTokenData`).
   * @returns `Tokens` containing `accessToken` (15 m) and `refreshToken` (7 d).
   */
  async generateTokens(payload: UserTokenData): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ])

    return { accessToken, refreshToken }
  }

  /**
   * Verifies a refresh token and returns its decoded payload.
   * Throws `UnauthorizedException` if the token is invalid or expired —
   * never exposes the underlying JWT error to the client.
   * @param token - The raw refresh token string from the request.
   * @returns Decoded `UserTokenData` on success.
   */
  async verifyRefreshToken(token: string): Promise<UserTokenData> {
    try {
      return await this.jwtService.verifyAsync<UserTokenData>(token, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      })
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }
  }
}
