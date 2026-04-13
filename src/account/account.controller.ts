import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { Throttle } from '@nestjs/throttler'

import { AccountService } from '@account/account.service'
import { UpdatePreferencesDTO } from '@account/dto/update-preferences.dto'
import { UpdateRoleDTO } from '@account/dto/update-role.dto'
import { NewAccountDTO } from '@account/new-account.dto'
import { Account } from '@account/types/account.type'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'

@Controller('accounts')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Throttle({ default: { ttl: 3600000, limit: 5 } })
  @Post()
  async create(@Body() payload: NewAccountDTO): Promise<Account> {
    return await this.accountService.create(payload)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listAll(): Promise<Account[]> {
    return await this.accountService.listAll()
  }

  @Get('email/:email')
  @UseGuards(JwtAuthGuard)
  async getByEmail(@Param('email') email: string): Promise<Account> {
    return await this.accountService.getByEmail(email)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getById(@Param('id') id: string): Promise<Account> {
    return await this.accountService.getById(id)
  }

  // @Get(':id/login-history')
  // @UseGuards(JwtAuthGuard)
  // async getLoginHistory(
  //   @Param('id') id: string,
  //   @Query('limit') limit?: number,
  // ): Promise<any> {
  //   return await this.accountService.getLoginHistory(id, limit)
  // }

  @Patch(':id/preferences')
  @UseGuards(JwtAuthGuard)
  async updatePreferences(
    @Param('id') id: string,
    @Body() payload: UpdatePreferencesDTO,
  ): Promise<Account> {
    return await this.accountService.updatePreferences(
      id,
      payload.locale,
      payload.timezone,
    )
  }

  @Patch(':id/role')
  @UseGuards(JwtAuthGuard)
  async updateRole(
    @Param('id') id: string,
    @Body() payload: UpdateRoleDTO,
  ): Promise<Account> {
    return await this.accountService.updateRole(id, payload.roleId)
  }

  @Patch(':id/deactivate')
  @UseGuards(JwtAuthGuard)
  async deactivate(@Param('id') id: string): Promise<void> {
    return await this.accountService.deactivate(id)
  }

  @Patch(':id/activate')
  @UseGuards(JwtAuthGuard)
  async activate(@Param('id') id: string): Promise<void> {
    return await this.accountService.activate(id)
  }
}
