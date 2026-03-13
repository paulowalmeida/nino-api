import { AuthRepository } from '@auth/auth.repository';
import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto';
import { UserCreated } from '@auth/types/user/user-created.type';
import { UserRegisterOrm } from '@auth/types/user/user-register-orm.type';

export class AuthAdapter {
  static adaptNewRegister = (data: NewUserRequestDTO): UserRegisterOrm => {
    return {
      data: {
        hashedRefreshToken: null,
        role: {
          connect: {
            code: data.role as unknown as number,
          }
        },
        personalData: {
          create: {
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName
          }
        },
      },
      include: {
        personalData: true,
        role: true,
      }
    }
  }

  static adaptCreatedUser = (
    newUser: Awaited<ReturnType<typeof AuthRepository.prototype.registerNewUser>>
  ): UserCreated => ({
    id: newUser.id,
    personalData: newUser.personalData ? {
      email: newUser.personalData.email,
      firstName: newUser.personalData.firstName,
      lastName: newUser.personalData.lastName,
    } : undefined,
    role: {
      code: newUser.role.code,
      description: newUser.role.description,
    }
  })
}


