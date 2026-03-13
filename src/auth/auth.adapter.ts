import { NewUserRequestDTO } from '@auth/dtos/user-register-request.dto';
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
}


