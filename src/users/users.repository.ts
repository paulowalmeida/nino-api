import { Injectable } from '@nestjs/common'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class UsersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  // async getCurrentUserProfile(id: string) {
  //   try {
  //     const user = await this.prisma.user.findUnique({
  //       where: { id },
  //     })
  //     return user
  //   } catch (error
  //   }
  // }
}
