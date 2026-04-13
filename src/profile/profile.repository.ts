import { Injectable, NotFoundException } from '@nestjs/common'

import { ProfileDto } from '@profile/dto/profile.dto'
import { Profile } from '@profile/types/profile-repository.type'
import { PrismaErrorService } from '@shared/services/prisma/prisma-error.service'
import { PrismaService } from '@shared/services/prisma/prisma.service'

@Injectable()
export class ProfileRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prismaErrorService: PrismaErrorService,
  ) {}

  async create(id: string, profile: ProfileDto): Promise<Profile> {
    try {
      return await this.prisma.profile.create({
        data: {
          companyName: profile.companyName,
          cnpj: profile.cnpj,
          userId: id,
        },
        include: {
          addresses: true,
          contacts: true,
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getList(): Promise<Profile[]> {
    try {
      return await this.prisma.profile.findMany({
        include: {
          addresses: { omit: { profileId: true } },
          contacts: { omit: { profileId: true } },
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async getById(id: string): Promise<Profile> {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { id },

        include: {
          addresses: { omit: { profileId: true } },
          contacts: { omit: { profileId: true } },
        },
      })

      if (!profile) throw new NotFoundException('Profile not found')

      return profile
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async update(id: string, profile: ProfileDto): Promise<Profile> {
    try {
      return await this.prisma.profile.update({
        data: {
          companyName: profile.companyName,
          cnpj: profile.cnpj,
        },
        where: { id },
        include: {
          addresses: true,
          contacts: true,
        },
      })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.profile.delete({ where: { id } })
    } catch (error) {
      this.prismaErrorService.handleError(error)
    }
  }
}
