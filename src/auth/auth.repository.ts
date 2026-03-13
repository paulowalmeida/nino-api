import { Injectable } from '@nestjs/common';

import { AuthAdapter } from '@auth/auth.adapter';
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto';
import { PrismaService } from '@shared/services/prisma/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) { }

  async findByEmail(email: string) {
    return await this.prisma.personalData.findUnique({
      where: { email },
      include: {
        user: {
          include: {
            role: true,
          }
        }
      }
    });
  }

  async registerNewUser(newRegister: NewUserRequestDTO) {
    const newUser =
      await this.prisma.user.create(AuthAdapter.adaptNewRegister(newRegister));
    return {
      ...newUser,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    };
  }

  async updateRefreshToken(userId: string, hashedRefreshToken: string) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: { hashedRefreshToken }
    });
  }
}