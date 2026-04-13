import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { UserRepository } from '@user/user.repository'
import { UserTokenData } from '@user/types/user-token.data.type'
import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { LoginResponse } from '@auth/types/login-response.type'
import { Tokens } from '@auth/types/tokens.type'
import { CredentialsService } from '@credential/credential.service'
import { PasswordService } from '@shared/services/password/password.service'
import { TokenService } from '@shared/services/token/token.service'
import { AuthRequest } from '@shared/types/auth-request.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly credentialsService: CredentialsService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  async changePassword(
    request: AuthRequest,
    body: ChangePasswordRequestDTO,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = body
    const { email } = request.user

    const credential = await this.credentialsService.getByEmail(email)

    if (!credential.password)
      throw new UnauthorizedException('Invalid credentials')

    await this.passwordService.validate(oldPassword, credential.password)

    await this.credentialsService.updatePassword(credential.id, newPassword)

    return { message: 'Password changed successfully' }
  }

  async login(payload: LoginRequestDTO): Promise<LoginResponse> {
    const credential = await this.credentialsService.getByEmail(payload.email)

    if (!credential.email || !credential.password)
      throw new UnauthorizedException('Invalid credentials')

    await this.passwordService.validate(payload.password, credential.password)

    const user = await this.userRepository.findById(credential.userId)
    this.validateRole(user.role.id)
    await this.userRepository.updateLastLogin(user.id)

    const tokenData: UserTokenData = {
      sub: user.id,
      email: credential.email,
      role: user.role.id || 0,
    }

    const tokens = await this.tokenService.getTokens(tokenData)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return { user, tokens }
  }

  async logout(userId: string): Promise<void> {
    return this.credentialsService.removeRefreshToken(userId)
  }

  async refreshToken(
    userId: string,
    token: string | undefined,
  ): Promise<Tokens> {
    const credential = await this.credentialsService.getRefreshToken(userId)

    if (!token || !credential.hashedRefreshToken || !credential.email)
      throw new UnauthorizedException('Invalid credentials')

    await this.passwordService.validate(token, credential.hashedRefreshToken)

    const user = await this.userRepository.findById(userId)

    const tokenData: UserTokenData = {
      sub: user.id,
      email: credential.email,
      role: user.role.id || 0,
    }

    const tokens = await this.tokenService.getTokens(tokenData)
    await this.updateRefreshToken(user.id, tokens.refreshToken)

    return tokens
  }

  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await this.passwordService.hash(refreshToken)
    await this.credentialsService.updateRefreshToken(userId, hashed)
  }

  private validateRole(role: number): void {
    if (!role) throw new HttpException('User role not found', 500)
  }
}
