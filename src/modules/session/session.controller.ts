import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { CreateSessionDto } from './dtos/create-session.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { Session } from './entities/session.entity'
import { SessionService } from './session.service'
import { SessionResponse } from './types/session.response.type'

@Controller('sessions')
@UseGuards(JwtAuthGuard)
export class SessionController {
  constructor(private readonly sessionsService: SessionService) {}

  @Post()
  async create(@Body() createDto: CreateSessionDto): Promise<Session> {
    return await this.sessionsService.create(createDto)
  }

  @Get('list-by-user-id/:userId')
  async getListByUserId(
    @Param('userId') userId: string,
  ): Promise<SessionResponse[]> {
    return await this.sessionsService.getListByUserId(userId)
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<SessionResponse> {
    return await this.sessionsService.getById(id)
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSessionDto,
  ): Promise<SessionResponse> {
    await this.sessionsService.update(id, updateDto)
    return await this.sessionsService.getById(id)
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.sessionsService.delete(id)
    return { message: 'session deleted successfully' }
  }
}
