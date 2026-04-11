import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'

import { AuthRepository } from '@auth/auth.repository'
import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewAccountRequestDTO } from '@auth/dtos/new-account-request.dto'
import { AuthRequest } from '@auth/types/account/account-auth-request.type'
import { AccountRepository } from '@auth/types/account/account-repository.type'
import { AccountTokenData } from '@auth/types/account/account-token.data.type'
import { Account } from '@auth/types/account/account.type'
import { LoginResponse } from '@auth/types/login-response.type'
import { Tokens } from '@auth/types/tokens.type'
import { PasswordService } from './password.service'
import { TokenService } from './token.service'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly passwordService: PasswordService,
  ) {}

  async changePassword(
    request: AuthRequest,
    body: ChangePasswordRequestDTO,
  ): Promise<{ message: string }> {
    const { oldPassword, newPassword } = body
    const { email } = request.account

    const found = await this.getAccountByEmail(email)
    await this.passwordService.validate(oldPassword, found.password)

    const newPasswordHash = await this.passwordService.hash(newPassword)
    await this.authRepository.updateAccountPassword(email, newPasswordHash)

    return { message: 'Password changed successfully' }
  }

  async createAccount(payload: NewAccountRequestDTO): Promise<Account> {
    const cryptedPassword = await this.passwordService.hash(payload.password)
    return this.authRepository.createAccount({
      ...payload,
      password: cryptedPassword,
    })
  }

  async getAccount(email: string): Promise<Account> {
    const account = await this.getAccountByEmail(email)
    return this.parseToAccount(account)
  }

  async login(payload: LoginRequestDTO): Promise<LoginResponse> {
    const found = await this.getAccountByEmail(payload.email)
    const validated = await this.executeValidations(found, payload.password)

    const tokenData: AccountTokenData = {
      sub: validated.id,
      email: validated.email,
      role: validated.role.code || 0,
    }

    const tokens = await this.tokenService.getTokens(tokenData)
    await this.updateRefreshToken(validated.id, tokens.refreshToken)

    return { account: validated, tokens }
  }

  async logout(id: string): Promise<void> {
    return this.authRepository.removeHashedRefreshToken(id)
  }

  async refreshToken(
    accountId: string,
    token: string | undefined,
  ): Promise<Tokens> {
    const account = await this.authRepository.getRefreshToken(accountId)

    if (!token || !account.hashedRefreshToken)
      throw new UnauthorizedException('Invalid credentials')

    await this.passwordService.validate(token, account.hashedRefreshToken)

    const tokenData: AccountTokenData = {
      sub: account.id,
      email: account.email,
      role: account.role.code || 0,
    }

    const tokens = await this.tokenService.getTokens(tokenData)
    await this.updateRefreshToken(account.id, tokens.refreshToken)

    return tokens
  }

  private async executeValidations(
    found: AccountRepository | null,
    password: string,
  ): Promise<Account> {
    const account = this.validateAccount(found)
    await this.passwordService.validate(password, account.password)
    this.validateRole(account.role.code)
    return this.parseToAccount(account)
  }

  private async updateRefreshToken(
    accountId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashed = await this.passwordService.hash(refreshToken)
    await this.authRepository.updateRefreshToken(accountId, hashed)
  }

  private async getAccountByEmail(email: string): Promise<AccountRepository> {
    const found = await this.authRepository.findAccountByEmail(email)
    if (!found) throw new UnauthorizedException('Invalid credentials')
    return found
  }

  private parseToAccount(account: AccountRepository): Account {
    const { password, hashedRefreshToken, userId, ...rest } = account
    return { ...rest }
  }

  private validateAccount(found: AccountRepository | null): AccountRepository {
    if (!found) throw new UnauthorizedException('Invalid credentials')
    return found
  }

  private validateRole(role: number): void {
    if (!role) throw new HttpException('Account role not found', 500)
  }
}
