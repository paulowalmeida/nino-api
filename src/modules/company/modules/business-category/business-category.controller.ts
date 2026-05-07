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

import { BusinessCategory } from '@prisma/client'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { BusinessCategoryQueryDto } from './dtos/business-category-query.dto'
import { CreateBusinessCategoryDto } from './dtos/create-business-category.dto'
import { UpdateBusinessCategoryDto } from './dtos/update-business-category.dto'
import { BusinessCategoryService } from './business-category.service'
import { BusinessCategoryPaginatedResponse } from './types/business-category-paginated-response.type'

@Controller('business-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BusinessCategoryController {
  constructor(private readonly service: BusinessCategoryService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  getAll(
    @Query() query: BusinessCategoryQueryDto,
  ): Promise<BusinessCategoryPaginatedResponse> {
    return this.service.getAll(query)
  }

  @Get(':id')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  getById(@Param('id') id: string): Promise<BusinessCategory> {
    return this.service.getById(id)
  }

  @Post()
  @Roles(GlobalRole.ADMIN)
  create(
    @Body() body: CreateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    return this.service.create(body)
  }

  @Put(':id')
  @Roles(GlobalRole.ADMIN)
  update(
    @Param('id') id: string,
    @Body() body: UpdateBusinessCategoryDto,
  ): Promise<BusinessCategory> {
    return this.service.update(id, body)
  }

  @Delete(':id')
  @Roles(GlobalRole.ADMIN)
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.service.delete(id)
  }
}
