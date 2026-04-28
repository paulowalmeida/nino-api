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
import { SessionService } from './session.service'
import { Session } from '@session/entities/session.entity'

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionsService: SessionService) {}

  @Post()
  async create(@Body() createDto: CreateSessionDto): Promise<Session> {
    return await this.sessionsService.create(createDto)
  }

  @Get('list-by-user-id/:userId')
  @UseGuards(JwtAuthGuard)
  async getListByUserId(@Param('userId') userId: string): Promise<Session[]> {
    return await this.sessionsService.getListByUserId(userId)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<Session> {
    return await this.sessionsService.getById(id)
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSessionDto,
  ): Promise<Session> {
    await this.sessionsService.update(id, updateDto)
    return await this.sessionsService.getById(id)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.sessionsService.delete(id)
    return { message: 'session deleted successfully' }
  }
}
