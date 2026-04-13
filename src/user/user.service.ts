import { Injectable } from '@nestjs/common'

import { PasswordService } from '@shared/services/password/password.service'
import { NewUserDTO } from '@user/new-user.dto'
import { User } from '@user/types/user.type'
import { UserRepository } from '@user/user.repository'

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async create(payload: NewUserDTO): Promise<User> {
    const cryptedPassword = await this.passwordService.hash(payload.password)
    return await this.userRepository.createWithCredential(
      payload.roleId,
      payload.email,
      cryptedPassword,
    )
  }

  async listAll(): Promise<User[]> {
    return await this.userRepository.findAll()
  }

  async getById(id: string): Promise<User> {
    return await this.userRepository.findById(id)
  }

  async updatePreferences(
    id: string,
    locale?: string,
    timezone?: string,
  ): Promise<User> {
    return await this.userRepository.updatePreferences(id, locale, timezone)
  }

  async updateRole(id: string, roleId: number): Promise<User> {
    return await this.userRepository.updateRole(id, roleId)
  }

  async deactivate(id: string): Promise<void> {
    return await this.userRepository.deactivate(id)
  }

  async activate(id: string): Promise<void> {
    return await this.userRepository.activate(id)
  }

  async getByEmail(email: string): Promise<User> {
    return await this.userRepository.findByEmail(email)
  }

  // async getLoginHistory(id: string, limit?: number): Promise<any> {
  //   return await this.userRepository.getLoginHistory(id, limit)
  // }
}
