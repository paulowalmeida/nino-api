import { createHash } from 'crypto'
import { Injectable, UnauthorizedException } from '@nestjs/common'

import { CredentialsService } from '@credential/credential.service'
import { GlobalRoleService } from '@role/global/global-role.service'
import { SessionService } from '@session/session.service'
import { PasswordService } from '@shared/services/password/password.service'
import { TokenService } from '@shared/services/token/token.service'
import { UserService } from '@user/user.service'
import { UserResponse } from '@user/types/user-response.type'
import { LoginRequestDto } from './dtos/login-request.dto'
import { RegisterRequestDto } from './dtos/register-request.dto'
import { LoginResponse } from './types/login-response.type'
import { Tokens } from './types/tokens.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly credentialsService: CredentialsService,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly roleService: GlobalRoleService,
  ) {}

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  async login(
    dto: LoginRequestDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<LoginResponse> {
    const credential =
      await this.credentialsService.getByEmailWithPassword(dto.email)

    if (!credential.password) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isPasswordValid = await this.passwordService.compare(
      dto.password,
      credential.password,
    )
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const user = await this.userService.getById(credential.userId)
    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      role: user.role.name,
    })
    await this.sessionService.create({
      userId: user.id,
      refreshToken: this.hashToken(tokens.refreshToken),
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { user, tokens }
  }

  async me(userId: string): Promise<UserResponse> {
    return await this.userService.getById(userId)
  }

  async register(dto: RegisterRequestDto): Promise<UserResponse> {
    const role = await this.roleService.getByName(dto.globalRole)
    const user = await this.userService.create({
      name: dto.name,
      globalRoleId: role.id,
    })

    await this.credentialsService.create({
      userId: user.id,
      email: dto.email,
      password: dto.password,
    })

    return this.userService.getById(user.id)
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessionService.getByRefreshToken(
      this.hashToken(refreshToken),
    )
    await this.sessionService.delete(session.id)
  }

  async refresh(
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<Tokens> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken)
    const hashedToken = this.hashToken(refreshToken)
    const session =
      await this.sessionService.findByRefreshToken(hashedToken)

    if (!session) {
      await this.sessionService.deleteAllByUserId(payload.sub)
      throw new UnauthorizedException('Refresh token reuse detected')
    }

    const tokens = await this.tokenService.generateTokens({
      sub: payload.sub,
      role: payload.role,
    })
    await this.sessionService.update(session.id, {
      refreshToken: this.hashToken(tokens.refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return tokens
  }
}
