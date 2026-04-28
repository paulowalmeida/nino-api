import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '@user/entities/user.entity'
import { ErrorService } from '@shared/services/error/error.service'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly errorService: ErrorService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      const user = this.repository.create(data)
      return await this.repository.save(user)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getAll(): Promise<User[]> {
    try {
      return await this.repository.find({ order: { name: 'ASC' } })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<User> {
    try {
      const user = await this.repository.findOneBy({ id })
      if (!user) throw new NotFoundException('User not found')
      return user
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByCompanyId(companyId: string): Promise<User[]> {
    try {
      return await this.repository.findBy({ companyId })
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<void> {
    try {
      const user = await this.getById(id)
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
