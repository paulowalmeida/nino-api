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

import { Session } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'

import { CreateSessionDto } from './dtos/create-session.dto'
import { SessionQueryDto } from './dtos/session-query.dto'
import { UpdateSessionDto } from './dtos/update-session.dto'
import { SessionService } from './session.service'
import { SessionPaginatedResponse } from './types/session-paginated-response.type'
import { SessionResponse } from './types/session.response.type'

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly service: SessionService) {}

  @Post()
  @Roles(GlobalRole.ADMIN)
  async create(@Body() createDto: CreateSessionDto): Promise<Session> {
    return this.service.create(createDto)
  }

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async getAll(
    @Query() query: SessionQueryDto,
  ): Promise<SessionPaginatedResponse> {
    return this.service.getAll(query)
  }

  @Get('list-by-user-id/:userId')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async getListByUserId(
    @Param('userId') userId: string,
    @Query() query: SessionQueryDto,
  ): Promise<SessionPaginatedResponse> {
    return this.service.getListByUserId(userId, query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async getById(@Param('id') id: string): Promise<SessionResponse> {
    return this.service.getById(id)
  }

  @Patch(':id')
  @Roles(GlobalRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSessionDto,
  ): Promise<SessionResponse> {
    return this.service.update(id, updateDto)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
