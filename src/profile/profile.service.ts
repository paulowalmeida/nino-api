import { Injectable, NotFoundException } from '@nestjs/common'

import { ProfileDto } from '@profile/dto/profile.dto'
import { Profile } from '@profile/types/profile-repository.type'
import { ProfileRepository } from './profile.repository'

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async create(id: string, profile: ProfileDto): Promise<Profile> {
    return await this.profileRepository.create(id, profile)
  }

  async getList(): Promise<Profile[]> {
    return await this.profileRepository.getList()
  }

  async getById(id: string): Promise<Profile> {
    const profile = await this.profileRepository.getById(id)
    if (!profile) throw new NotFoundException('Profile not found')
    return profile
  }

  async update(id: string, profile: ProfileDto): Promise<Profile> {
    return await this.profileRepository.update(id, profile)
  }

  async delete(id: string): Promise<void> {
    await this.profileRepository.delete(id)
  }
}
