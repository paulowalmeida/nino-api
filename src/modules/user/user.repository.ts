import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { Credential } from '@credential/entities/credential.entity'
import { User } from '@user/entities/user.entity'
import { UserResponse } from '@user/types/user.type'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly errorService: ErrorService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.repository.save(this.repository.create(data))
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  private async fetchCredentials(userId: string) {
    const items = await this.credentialRepository.find({ where: { userId } })
    return items.map(({ password: _, ...c }) => c)
  }

  async getAll(): Promise<UserResponse[]> {
    try {
      const users = await this.repository.find({
        order: { name: 'ASC' },
        relations: ['role', 'company'],
      })
      return Promise.all(
        users.map(async (user) => ({
          ...user,
          credentials: await this.fetchCredentials(user.id),
        })),
      ) as Promise<UserResponse[]>
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<UserResponse> {
    try {
      const user = await this.repository.findOne({
        where: { id },
        relations: ['role', 'company'],
      })
      if (!user) throw new NotFoundException('User not found')
      return {
        ...user,
        credentials: await this.fetchCredentials(id),
      } as UserResponse
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCompanyId(companyId: string): Promise<UserResponse[]> {
    try {
      const users = await this.repository.find({
        where: { companyId },
        relations: ['role', 'company'],
      })
      return Promise.all(
        users.map(async (user) => ({
          ...user,
          credentials: await this.fetchCredentials(user.id),
        })),
      ) as Promise<UserResponse[]>
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    try {
      const user = await this.repository.findOne({ where: { id } })
      if (!user) throw new NotFoundException('User not found')
      Object.assign(user, data)
      await this.repository.save(user)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.getById(id)
      await this.repository.delete(id)
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
