import { Injectable } from '@nestjs/common'

import { AccountRepository } from '@account/account.repository'
import { NewAccountDTO } from '@account/new-account.dto'
import { Account } from '@account/types/account.type'
import { CredentialsService } from '@credential/credential.service'
import { PasswordService } from '@shared/services/password/password.service'

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly credentialsService: CredentialsService,
    private readonly passwordService: PasswordService,
  ) {}

  async create(payload: NewAccountDTO): Promise<Account> {
    const cryptedPassword = await this.passwordService.hash(payload.password)
    return await this.accountRepository.createWithCredential(
      payload.roleId,
      payload.email,
      cryptedPassword,
    )
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
