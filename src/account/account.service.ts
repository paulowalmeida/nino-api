import { Injectable } from '@nestjs/common'

import { AccountRepository } from '@account/account.repository'
import { Account } from '@account/types/account.type'
import { NewAccountDTO } from '@account/new-account.dto'
import { CredentialsService } from '@credential/credential.service'

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly credentialsService: CredentialsService,
  ) {}

  async create(payload: NewAccountDTO): Promise<Account> {
    const account = await this.accountRepository.create(payload.roleId)
    await this.credentialsService.create(
      account.id,
      payload.email,
      payload.password,
      'local',
    )
    return await this.accountRepository.findById(account.id)
  }

  async listAll(): Promise<Account[]> {
    return await this.accountRepository.findAll()
  }

  async getById(id: string): Promise<Account> {
    return await this.accountRepository.findById(id)
  }

  async updatePreferences(
    id: string,
    locale?: string,
    timezone?: string,
  ): Promise<Account> {
    return await this.accountRepository.updatePreferences(id, locale, timezone)
  }

  async updateRole(id: string, roleId: number): Promise<Account> {
    return await this.accountRepository.updateRole(id, roleId)
  }

  async deactivate(id: string): Promise<void> {
    return await this.accountRepository.deactivate(id)
  }

  async activate(id: string): Promise<void> {
    return await this.accountRepository.activate(id)
  }

  async getByEmail(email: string): Promise<Account> {
    return await this.accountRepository.findByEmail(email)
  }

  // async getLoginHistory(id: string, limit?: number): Promise<any> {
  //   return await this.accountRepository.getLoginHistory(id, limit)
  // }
}