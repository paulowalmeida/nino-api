import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { ErrorService } from '@shared/services/error/error.service'
import { CreateCredentialDto } from './dto/create-credentail.dto'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { Credential } from './entities/credential.entity'
import { CredentialRepositoryType } from './types/credential-repository.type'
import { CredentialResponse } from './types/credential.response.type'

@Injectable()
export class CredentialsRepository {
  constructor(
    @InjectRepository(Credential)
    private readonly repository: Repository<Credential>,
    private readonly errorService: ErrorService,
  ) {}

  async create(data: CreateCredentialDto): Promise<CredentialResponse> {
    try {
      const saved = await this.repository.save(this.repository.create(data))
      const { userId: _, password: __, ...rest } = saved
      return rest
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getAll(userId: string): Promise<CredentialResponse[]> {
    try {
      const items = await this.repository.find({ where: { userId } })
      return items.map(({ userId: _, password: __, ...rest }) => rest)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getById(id: string): Promise<CredentialResponse> {
    try {
      const credential = await this.repository.findOne({ where: { id } })
      if (!credential) throw new NotFoundException('Credential not found')
      const { userId: _, password: __, ...rest } = credential
      return rest
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByIdWithPassword(id: string): Promise<CredentialRepositoryType> {
    try {
      const credential = await this.repository.findOne({ where: { id } })
      if (!credential) throw new NotFoundException('Credential not found')
      return credential
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByEmail(email: string): Promise<CredentialResponse> {
    try {
      const credential = await this.repository.findOneBy({
        email,
        provider: 'local',
      })
      if (!credential) throw new NotFoundException('Credential not found')
      const { userId: _, password: __, ...rest } = credential
      return rest
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async getByEmailWithPassword(
    email: string,
  ): Promise<CredentialRepositoryType> {
    try {
      const credential = await this.repository.findOne({
        where: { email, provider: 'local' },
      })
      if (!credential) throw new NotFoundException('Credential not found')
      return credential
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async update(
    id: string,
    data: UpdateCredentialDto,
  ): Promise<CredentialResponse> {
    try {
      const credential = await this.repository.findOne({ where: { id } })
      if (!credential) throw new NotFoundException('Credential not found')
      Object.assign(credential, data)
      const saved = await this.repository.save(credential)
      const { userId: _, password: __, ...rest } = saved
      return rest
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async updatePassword(id: string, password: string): Promise<void> {
    try {
      const credential = await this.repository.findOne({ where: { id } })
      if (!credential) throw new NotFoundException('Credential not found')
      credential.password = password
      await this.repository.save(credential)
    } catch (error) {
      this.errorService.handle(error)
    }
  }

  async delete(id: string): Promise<{ message: string }> {
    try {
      await this.getById(id)
      await this.repository.softDelete(id)
      return { message: 'Credential deleted successfully' }
    } catch (error) {
      this.errorService.handle(error)
    }
  }
}
