import { Injectable } from '@nestjs/common'

import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserQueryDto } from './dtos/user-query.dto'
import { UserPaginatedResponse } from './types/user-paginated-response.type'
import { UserResponse } from './types/user-response.type'
import { UserRepository } from './user.repository'

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(createDto: CreateUserDto): Promise<UserResponse> {
    const user = await this.userRepository.create(createDto)
    return this.userRepository.getById(user.id)
  }

  async getAll(query: UserQueryDto): Promise<UserPaginatedResponse> {
    return await this.userRepository.getAll(query)
  }

  async getById(id: string): Promise<UserResponse> {
    return this.userRepository.getById(id)
  }

  async getByCompanyId(companyId: string): Promise<UserResponse[]> {
    return this.userRepository.getByCompanyId(companyId)
  }

  async update(id: string, updateDto: UpdateUserDto): Promise<void> {
    return this.userRepository.update(id, updateDto)
  }

  async delete(id: string): Promise<void> {
    return this.userRepository.delete(id)
  }
}
