import { Injectable } from '@nestjs/common'

import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { User } from '@user/entities/user.entity'
import { UserRepository } from './user.repository'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createDto: CreateUserDto): Promise<User> {
    return this.userRepository.create(createDto)
  }

  async getAll(): Promise<User[]> {
    return await this.userRepository.getAll()
  }

  async getById(id: string): Promise<User> {
    return this.userRepository.getById(id)
  }

  async getByCompanyId(companyId: string): Promise<User[]> {
    return this.userRepository.getByCompanyId(companyId)
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<void> {
    return this.userRepository.update(id, updateDto)
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id)
  }
}
