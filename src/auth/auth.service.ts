import { Injectable, UnauthorizedException } from '@nestjs/common'

import { LoginRequestDto } from '@auth/dtos/login-request.dto'
import { CredentialsService } from '@credential/credential.service'
import { RoleService } from '@role/role.service'
import { SessionService } from '@session/session.service'
import { PasswordService } from '@shared/services/password/password.service'
import { TokenService } from '@shared/services/token/token.service'
import { UserService } from '@user/user.service'
import { RegisterRequestDto } from './dtos/register-request.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly credentialsService: CredentialsService,
    private readonly sessionService: SessionService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly roleService: RoleService,
  ) {}

  async login(dto: LoginRequestDto, ipAddress?: string, userAgent?: string) {
    const credential = await this.credentialsService.getByEmail(dto.email)

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

    const user = await this.userService.getById(credential.id)
    const tokens = await this.tokenService.generateTokens({
      sub: user.id,
      role: user.roleId,
    })
    await this.sessionService.create({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      ipAddress,
      userAgent,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return { user, tokens }
  }

  async register(dto: RegisterRequestDto) {
    const role = await this.roleService.getByName(dto.role)
    const user = await this.userService.create({
      name: dto.name,
      roleId: role.id,
    })

    await this.credentialsService.create({
      userId: user.id,
      email: dto.email,
      password: dto.password,
    })

    return user
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessionService.getByRefreshToken(refreshToken)
    await this.sessionService.delete(session.id)
  }

  async refresh(refreshToken: string, ipAddress?: string, userAgent?: string) {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken)
    const session = await this.sessionService.getByRefreshToken(refreshToken)
    const tokens = await this.tokenService.generateTokens({
      sub: payload.sub,
      role: payload.role,
    })
    await this.sessionService.update(session.id, {
      refreshToken: tokens.refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    })

    return tokens
  }
}
