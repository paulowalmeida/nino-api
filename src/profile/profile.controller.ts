import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common'

import { ProfileDto } from '@profile/dto/profile.dto'
import { Profile } from '@profile/types/profile-repository.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import type { AuthRequest } from '@shared/types/auth-request.type'
import { ProfileService } from './profile.service'

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getList(): Promise<Profile[]> {
    return await this.profileService.getList()
  }

  @Get('/:id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<Profile> {
    return await this.profileService.getById(id)
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @Req() req: AuthRequest,
    @Body() body: ProfileDto,
  ): Promise<Profile> {
    return await this.profileService.create(req.user.sub, body)
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() body: ProfileDto,
  ): Promise<Profile> {
    return await this.profileService.update(id, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.profileService.delete(id)
    return { message: 'Profile deleted' }
  }
}
