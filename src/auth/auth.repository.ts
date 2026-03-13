import { ConflictException, Injectable } from '@nestjs/common';

import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto';
import { UserSchemaParsed } from '@auth/schemas/user.schema';
import { User } from '@auth/types/user/user.repository.type';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@shared/services/prisma/prisma.service';
import { UserParsed } from './types/user/user-parsed.type';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string): Promise<UserParsed | null> {
    const userFound = await this.prisma.user.findFirst({
      where: {
        personalData: { email }
      },
      include: {
        personalData: true,
        role: true,
      }
    });

    if (!userFound) {
      return null;
    }

    return UserSchemaParsed.parse(userFound);
  }

  async createUser(newRegister: NewUserRequestDTO): Promise<UserParsed> {
    try {
      const newUser =
        await this.prisma.user.create({
          data: {
            hashedRefreshToken: null,
            role: {
              connect: {
                code: newRegister.role as unknown as number,
              }
            },
            personalData: {
              create: {
                email: newRegister.email,
                password: newRegister.password,
                firstName: newRegister.firstName,
                lastName: newRegister.lastName
              }
            },
          },
          include: {
            personalData: true,
            role: true,
          }
        });

      return UserSchemaParsed.parse(newUser);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('User already exists');
      }
      throw error;
    }
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken }
    });
  }
}