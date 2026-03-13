import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'

import * as bcrypt from 'bcrypt'
import { SignOptions } from 'jsonwebtoken'

import { AuthRepository } from '@auth/auth.repository'
import { LoginRequestDTO } from '@auth/dtos/login-request.dto'
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto'
import { UserCreatedSchema } from '@auth/schemas/user-created.schema'
import { LoginResponse } from '@auth/types/login-response.type'
import { UserCreated } from '@auth/types/user/user-created.respository.type'
import { UserTokenData } from '@auth/types/user/user-token.data.type'
import { UserLoginResponseSchema } from './schemas/user-login-response.schema'

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) { }

	async login(payload: LoginRequestDTO): Promise<LoginResponse> {
		const userFound = await this.authRepository.findByEmail(payload.email)

		if (!userFound) {
			throw new NotFoundException('User not found')
		}

		if (!await bcrypt.compare(payload.password, userFound.personalData.password)) {
			throw new UnauthorizedException('Invalid password')
		}

		if (!userFound.role) {
			throw new HttpException('User role not found', 500)
		}

		const tokens = await this.getTokens(
			userFound.id,
			userFound.personalData.email,
			userFound.role.code || 0,
		)

		const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10)

		await this.authRepository.updateRefreshToken(
			userFound.id,
			hashedRefreshToken,
		)

		return {
			user: UserLoginResponseSchema.parse(userFound),
			tokens
		}
	}

	async newUser(payload: NewUserRequestDTO): Promise<UserCreated> {
		const cryptedPassword = await bcrypt.hash(payload.password, 10)
		const newUser = await this.authRepository.createUser({
			...payload,
			password: cryptedPassword
		})

		return UserCreatedSchema.parse(newUser)
	}

	private generateTokens(
		objUser: UserTokenData,
		expiresIn: SignOptions['expiresIn'],
		secret: string,
	) {
		return this.jwtService.signAsync(
			objUser,
			{
				secret: this.configService.get<string>(secret),
				expiresIn: expiresIn,
			}
		)
	}

	private async getTokens(id: string, email: string, role: number) {
		const objUser: UserTokenData = {
			sub: id,
			email,
			role,
		}

		const accessToken = await this.generateTokens(objUser, '15m', 'JWT_SECRET')
		const refreshToken = await this.generateTokens(objUser, '7d', 'JWT_REFRESH_SECRET')

		return {
			accessToken,
			refreshToken,
		}
	}
}