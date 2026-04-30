import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { Role } from '@shared/enums/role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateSessionDto } from './dtos/create-session.dto'
import { SessionQueryDto } from './dtos/session-query.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { Session } from './entities/session.entity'
import { SessionService } from './session.service'
import { SessionPaginatedResponse } from './types/session-paginated-response.type'
import { SessionResponse } from './types/session.response.type'

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionsService: SessionService) {}

  @Post()
  @Roles(Role.ADMIN)
  async create(@Body() createDto: CreateSessionDto): Promise<Session> {
    return await this.sessionsService.create(createDto)
  }

  @Get('list-by-user-id/:userId')
  @Roles(Role.ADMIN, Role.SUPPORT)
  async getListByUserId(
    @Param('userId') userId: string,
    @Query() query: SessionQueryDto,
  ): Promise<SessionPaginatedResponse> {
    return await this.sessionsService.getListByUserId(userId, query)
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.SUPPORT)
  async getById(@Param('id') id: string): Promise<SessionResponse> {
    return await this.sessionsService.getById(id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSessionDto,
  ): Promise<SessionResponse> {
    await this.sessionsService.update(id, updateDto)
    return await this.sessionsService.getById(id)
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.SUPPORT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    await this.sessionsService.delete(id)
    return { message: 'session deleted successfully' }
  }
}
