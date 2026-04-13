import { Body, Controller, Get, Param, Patch } from '@nestjs/common'

import { UpdateCredentialDTO } from '@credential/dto/update-credential.dto'
import { Credential } from '@credential/types/credential.type'
import { CredentialsService } from './credential.service'

@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get('list-by-account-id/:accountId')
  async getListByAccountId(
    @Param('accountId') accountId: string,
  ): Promise<Credential[]> {
    return await this.credentialsService.getListByAccountId(accountId)
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Credential> {
    return await this.credentialsService.getById(id)
  }

  @Patch(':id/update-email')
  async updateEmail(
    @Param('id') id: string,
    @Body() updateCredentialDTO: UpdateCredentialDTO,
  ): Promise<Credential> {
    if (updateCredentialDTO.email) {
      await this.credentialsService.updateEmail(id, updateCredentialDTO.email)
    }
    return await this.credentialsService.getById(id)
  }

  @Patch(':id/update-password')
  async updatePassword(
    @Param('id') id: string,
    @Body() updateCredentialDTO: UpdateCredentialDTO,
  ): Promise<{ message: string }> {
    if (updateCredentialDTO.password) {
      await this.credentialsService.updatePassword(
        id,
        updateCredentialDTO.password,
      )
    }
    return { message: 'Password updated successfully' }
  }
}
