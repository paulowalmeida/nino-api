import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { AccountRepository } from '@account/account.repository'
import { AccountTokenData } from '@account/types/account-token.data.type'
import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { LoginResponse } from '@auth/types/login-response.type'
import { Tokens } from '@auth/types/tokens.type'
import { CredentialsService } from '@credential/credential.service'
import { PasswordService } from '@shared/services/password/password.service'
import { TokenService } from '@shared/services/token/token.service'
import { AuthRequest } from '@shared/types/account-auth-request.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly credentialsService: CredentialsService,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  async changePassword(
    request: AuthRequest,
    body: ChangePasswordRequestDTO,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = body
    const { email } = request.account

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

    const account = await this.accountRepository.findById(credential.accountId)
    this.validateRole(account.role.id)
    await this.accountRepository.updateLastLogin(account.id)

    const tokenData: AccountTokenData = {
      sub: account.id,
      email: credential.email,
      role: account.role.id || 0,
    }

    const tokens = await this.tokenService.getTokens(tokenData)
    await this.updateRefreshToken(account.id, tokens.refreshToken)

    return { account, tokens }
  }

  async logout(accountId: string): Promise<void> {
    return this.credentialsService.removeRefreshToken(accountId)
  }

  async refreshToken(
    accountId: string,
    token: string | undefined,
  ): Promise<Tokens> {
    const credential = await this.credentialsService.getRefreshToken(accountId)

    if (!token || !credential.hashedRefreshToken || !credential.email)
      throw new UnauthorizedException('Invalid credentials')

    await this.passwordService.validate(token, credential.hashedRefreshToken)

    const account = await this.accountRepository.findById(accountId)

    const tokenData: AccountTokenData = {
      sub: account.id,
      email: credential.email,
      role: account.role.id || 0,
    }

    const tokens = await this.tokenService.getTokens(tokenData)
    await this.updateRefreshToken(account.id, tokens.refreshToken)

    return tokens
  }

  private async updateRefreshToken(
    accountId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await this.passwordService.hash(refreshToken)
    await this.credentialsService.updateRefreshToken(accountId, hashed)
  }

  private validateRole(role: number): void {
    if (!role) throw new HttpException('Account role not found', 500)
  }
}
