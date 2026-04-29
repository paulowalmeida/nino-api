import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { PaginationService } from '@shared/services/pagination/pagination.service'
import { Credential } from '@credential/entities/credential.entity'
import { CredentialInfo } from '@credential/types/credential-info.type'
import { User } from '@user/entities/user.entity'
import { UserPaginatedResponse } from '@user/types/user-paginated-response.type'
import { UserResponse } from '@user/types/user-response.type'
import { CreateUserDto } from './dtos/create-user.dto'
import { UpdateUserDto } from './dtos/update-user.dto'
import { UserOrderBy } from './types/user-order-by.type'
import { UserQueryDto } from './dtos/user-query.dto'

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    private readonly errorService: ErrorService,
    private readonly paginationService: PaginationService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    try {
      return await this.repository.save(this.repository.create(data))
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  private async fetchCredentials(userId: string): Promise<CredentialInfo[]> {
    const items = await this.credentialRepository.find({ where: { userId } })
    return items.map(({ password: _, ...c }) => c)
  }

  private async toResponse(user: User): Promise<UserResponse> {
    return { ...user, credentials: await this.fetchCredentials(user.id) }
  }

  async getAll(query: UserQueryDto): Promise<UserPaginatedResponse> {
    try {
      const [users, total] = await this.repository.findAndCount({
        order: { [query.orderBy ?? UserOrderBy.NAME]: query.orderDir ?? 'ASC' },
        relations: ['role', 'company'],
        ...this.paginationService.getOptions(query),
      })
      const data = await Promise.all(users.map((user) => this.toResponse(user)))
      return this.paginationService.paginate(data, total, query)
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
      return this.toResponse(user)
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
      return Promise.all(users.map((user) => this.toResponse(user)))
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
