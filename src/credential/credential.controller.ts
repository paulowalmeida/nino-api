import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common'

import type { UserTokenData } from '@user/types/user-token.data.type'
import { UpdateCredentialDTO } from '@credential/dto/update-credential.dto'
import { Credential } from '@credential/types/credential.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { CredentialsService } from './credential.service'

@Controller('credentials')
export class CredentialController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get('list-by-user-id/:userId')
  @UseGuards(JwtAuthGuard)
  async getListByUserId(
    @Param('userId') userId: string,
  ): Promise<Credential[]> {
    return await this.credentialsService.getListByUserId(userId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<Credential> {
    return await this.credentialsService.getById(id)
  }

  @Patch(':id/update-email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(
    @Param('id') id: string,
    @Body() updateCredentialDTO: UpdateCredentialDTO,
  ): Promise<Credential> {
    if (updateCredentialDTO.email) {
      await this.credentialsService.updateEmail(id, updateCredentialDTO.email)
    }
    return await this.credentialsService.getById(id)
  }

  @Delete(':id/')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.credentialsService.delete(id)
    return { message: 'credential deleted successfully' }
  }
}
