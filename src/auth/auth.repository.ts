import { Injectable } from '@nestjs/common';

import { User } from '@auth/types/user/user.repository.type';
import { PrismaService } from '@shared/services/prisma/prisma.service';
import { UserSchema } from '@auth/schemas/user.schema';
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string): Promise<User | null> {
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

    return UserSchema.parse(userFound);
  }

  async createUser(newRegister: NewUserRequestDTO): Promise<User> {
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

    return UserSchema.parse(newUser);
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken }
    });
  }
}