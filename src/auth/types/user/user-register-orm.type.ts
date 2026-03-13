export type UserRegisterOrm = {
  data: {
    hashedRefreshToken: null,
    role: {
      connect: {
        code: number,
      }
    },
    personalData: {
      create: {
        email: string,
        password: string,
        firstName: string,
        lastName: string
      }
    },
  },
  include: {
    personalData: true,
    role: true,
  }
}
