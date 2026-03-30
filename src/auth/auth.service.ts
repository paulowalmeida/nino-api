import {
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'
import { SignOptions } from 'jsonwebtoken'

import { AuthRepository } from '@auth/auth.repository'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto'
import { LoginResponse } from '@auth/types/login-response.type'
import { UserCreated } from '@auth/types/user/user-created.type'
import { UserFoundRepository } from '@auth/types/user/user-found.repository.type'
import { UserFound } from '@auth/types/user/user-found.type'
import { UserTokenData } from '@auth/types/user/user-token.data.type'

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(payload: NewUserRequestDTO): Promise<UserCreated> {
    const cryptedPassword = await bcrypt.hash(payload.password, 10)
    return await this.authRepository.createUser({
      ...payload,
      password: cryptedPassword,
    })
  }

  async getCurrentUser(email: string): Promise<UserFound> {
    const userFoundRespository: UserFoundRepository | null =
      await this.authRepository.findUserByEmail(email)

    if (!userFoundRespository) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return this.parseToUserFound(userFoundRespository)
  }

  async login(payload: LoginRequestDTO): Promise<LoginResponse> {
    const userFound: UserFoundRepository | null =
      await this.authRepository.findUserByEmail(payload.email)

    const validatedUser = await this.executeValidations(
      userFound,
      payload.password,
    )

    const userDataToken = this.getUserTokenData(
      validatedUser.id,
      validatedUser.personalData.email,
      validatedUser.role.code || 0,
    )
    const tokens = await this.getTokens(userDataToken)
    await this.updateUserRefreshToken(validatedUser.id, tokens.refreshToken)
    return this.buildLoginResponse(validatedUser, tokens)
  }

  async logout(id: string): Promise<void> {
    return await this.authRepository.removeHashedRefreshToken(id)
  }

  async refreshToken(userId: string, token: string) {
    const userRefreshToken = await this.authRepository.getRefreshToken(userId)

    await this.checkHashsRefresh(token, userRefreshToken.hashedRefreshToken)

    const userDataToken = this.getUserTokenData(
      userRefreshToken.id,
      userRefreshToken.personalData.email,
      userRefreshToken.role.code || 0,
    )
    const tokens = await this.getTokens(userDataToken)
    await this.updateUserRefreshToken(userRefreshToken.id, tokens.refreshToken)
    return tokens
  }

  private buildLoginResponse(user: UserFound, tokens: any): LoginResponse {
    return {
      user,
      tokens,
    }
  }

  private async checkHashsRefresh(
    token,
    refreshToken: string | null,
  ): Promise<void> {
    if (!refreshToken) {
      throw new UnauthorizedException('Invalid credentials')
    }

    const isValid = await bcrypt.compare(token, refreshToken)

    if (!isValid) throw new UnauthorizedException('Invalid credentials')
  }

  private generateTokens(
    objUser: UserTokenData,
    expiresIn: SignOptions['expiresIn'],
    secret: string,
  ) {
    return this.jwtService.signAsync(objUser, {
      secret: this.configService.get<string>(secret),
      expiresIn: expiresIn,
    })
  }

  private async getTokens(user: UserTokenData) {
    const objUser: UserTokenData = {
      sub: user.sub,
      email: user.email,
      role: user.role || 0,
    }

    const accessToken = await this.generateTokens(objUser, '15m', 'JWT_SECRET')
    const refreshToken = await this.generateTokens(
      objUser,
      '7d',
      'JWT_REFRESH_SECRET',
    )

    return {
      accessToken,
      refreshToken,
    }
  }

  private getUserTokenData(
    id: string,
    email: string,
    role: number,
  ): UserTokenData {
    return {
      sub: id,
      email,
      role,
    } as UserTokenData
  }

  private async updateUserRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)
    await this.authRepository.updateRefreshToken(userId, hashedRefreshToken)
  }

  private async executeValidations(
    userFound: UserFoundRepository | null,
    passwd: string,
  ): Promise<UserFound> {
    const userValidated = await this.validateUser(userFound)
    await this.validatePassword(passwd, userValidated.personalData.password)
    this.validateRole(userValidated.role.code)
    return this.parseToUserFound(userValidated)
  }

  private parseToUserFound(user: UserFoundRepository): UserFound {
    const { password, ...personalData } = user.personalData
    return { ...user, personalData }
  }

  private async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<void> {
    const isValid = await bcrypt.compare(password, hashedPassword)
    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials')
    }
  }

  private validateRole(role: number): void {
    if (!role) {
      throw new HttpException('User role not found', 500)
    }
  }

  private validateUser(
    userFound: UserFoundRepository | null,
  ): UserFoundRepository {
    if (!userFound) {
      throw new UnauthorizedException('Invalid credentials')
    }

    return userFound
  }
}
