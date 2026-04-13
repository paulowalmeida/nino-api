import { Injectable, NotFoundException } from '@nestjs/common'

import { User } from '@user/types/user/user-repository.type'
import { UserDto } from './user.dto'
import { UserRepository } from './user.repository'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(id: string, user: UserDto): Promise<User> {
    return await this.userRepository.create(id, user)
  }

  async getList(): Promise<User[]> {
    return await this.userRepository.getList()
  }

  async getById(id: string): Promise<User> {
    const user = await this.userRepository.getById(id)
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async update(id: string, user: UserDto): Promise<User> {
    return await this.userRepository.update(id, user)
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id)
  }
}
