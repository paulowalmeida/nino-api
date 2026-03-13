import { UserCreated } from '@auth/types/user/user-created.type';
import { UserFoundByEmail } from './types/user/user-found-by-email.type';
import { UserLoginResponse } from './types/user/user-login-response.type';
import { NewUser } from './types/user/user-new.type';

export class AuthAdapter {
  static adaptCreatedUser = (
    newUser: NewUser
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

  static adaptUserLoginResponse = (
    data: UserFoundByEmail,
  ): UserLoginResponse => {
    const user = data?.user;
    const role = user?.role;

    return {
      user: {
        id: data?.id,
        createdAt: user?.createdAt,
        updatedAt: user?.updatedAt,
        personalData: {
          avatarUrl: data?.avatarUrl,
          birthDate: data?.birthDate,
          email: data?.email,
          firstName: data?.firstName,
          lastName: data?.lastName,
        },
        role: {
          code: role?.code,
          description: role?.description,
        }
      },
    }
  }
}


