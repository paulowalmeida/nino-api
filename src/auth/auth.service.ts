import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';
import { SignOptions } from 'jsonwebtoken';

import { AuthAdapter } from '@auth/auth.adapter';
import { AuthRepository } from '@auth/auth.repository';
import { LoginRequestDTO } from '@auth/dtos/login-request.dto';
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto';
import { UserTokenData } from '@auth/types/user/use-token-data.type';
import { UserCreated } from '@auth/types/user/user-created.type';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) { }

	async getTokens(id: string, email: string, role: number) {
		const objUser: UserTokenData = {
			sub: id,
			email,
			role,
		};

		const accessToken = await this.generateTokens(objUser, '15m', 'JWT_ACCESS_SECRET');
		const refreshToken = await this.generateTokens(objUser, '7d', 'JWT_REFRESH_SECRET');

		return {
			accessToken,
			refreshToken,
		};
	}

	async login(payload: LoginRequestDTO) {
		const userFound = await this.authRepository.findByEmail(payload.email);

		if (!userFound) {
			throw new NotFoundException('User not found');
		}

		if (!bcrypt.compareSync(payload.password, userFound.password)) {
			throw new HttpException('Invalid password', 401);
		}

		const tokens = await this.getTokens(
			userFound.id,
			userFound.email,
			userFound.user?.role.code || 0,
		);

		const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

		await this.authRepository.updateRefreshToken(
			userFound.id,
			hashedRefreshToken,
		);

		return {
			user: userFound,
			tokens,
		}
	}

	async newUser(payload: NewUserRequestDTO): Promise<UserCreated> {
		const salt = bcrypt.genSaltSync(10);
		const cryptedPassword = bcrypt.hashSync(payload.password, salt);
		const newUser = await this.authRepository.registerNewUser({
			...payload,
			password: cryptedPassword
		});

		return AuthAdapter.adaptCreatedUser(newUser);
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
		);
	}
}