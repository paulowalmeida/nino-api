import { ChangePasswordRequestDTO } from '@auth/dtos/change-password-request.dto'
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

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { CredentialsService } from './credential.service'
import { UpdateCredentialDto } from './dto/update-credential.dto'
import { Credential } from './types/credential.type'

@Controller('credentials')
@UseGuards(JwtAuthGuard)
export class CredentialController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get('list/:id')
  async getAll(@Param('userId') userId: string): Promise<Credential[]> {
    const credentials = await this.credentialsService.getAll(userId)
    return credentials.map(({ password, ...credential }) => credential)
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<Credential> {
    const { password, ...credential } =
      await this.credentialsService.getById(id)
    return credential
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateCredentialDto,
  ): Promise<Credential> {
    const { password, ...credential } = await this.credentialsService.update(
      id,
      updateDto,
    )
    return credential
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: any,
    @Body() body: ChangePasswordRequestDTO,
  ): Promise<{ message: string }> {
    const userId = req.user.sub
    await this.credentialsService.changePassword(
      userId,
      body.oldPassword,
      body.newPassword,
    )
    return { message: 'Password changed successfully' }
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.credentialsService.delete(id)
    return { message: 'credential deleted successfully' }
  }
}
