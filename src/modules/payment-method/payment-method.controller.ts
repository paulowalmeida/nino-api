import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CommonService } from '@shared/modules/common/common.service'
import { CreateCommonDto } from '@shared/modules/common/dtos/create-common.dto'
import { UpdateCommonDto } from '@shared/modules/common/dtos/update-common.dto'
import { CommonEntity } from '@shared/modules/common/types/common-entity.type'
import { PaginatedResponse } from '@shared/types/paginated-response.type'

@Controller('payment-methods')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PaymentMethodController {
  constructor(private readonly service: CommonService) {}

  @Get()
  @Roles(
    GlobalRole.ADMIN,
    GlobalRole.SUPPORT,
    GlobalRole.MERCHANT,
    GlobalRole.CUSTOMER,
  )
  async getAll(
    @Query() query: PaginatedQueryDto,
  ): Promise<PaginatedResponse<CommonEntity>> {
    return this.service.getAllPaginated({
      page: query.page,
      size: query.size,
      order: query.target
        ? { target: query.target, direction: query.direction ?? 'asc' }
        : undefined,
    })
  }

  @Get(':id')
  @Roles(
    GlobalRole.ADMIN,
    GlobalRole.SUPPORT,
    GlobalRole.MERCHANT,
    GlobalRole.CUSTOMER,
  )
  async getById(@Param('id') id: string): Promise<CommonEntity> {
    return this.service.getByField('id', id)
  }

  @Post()
  @Roles(GlobalRole.ADMIN)
  async create(@Body() body: CreateCommonDto): Promise<CommonEntity> {
    return this.service.create(body)
  }

  @Put(':id')
  @Roles(GlobalRole.ADMIN)
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCommonDto,
  ): Promise<CommonEntity> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
