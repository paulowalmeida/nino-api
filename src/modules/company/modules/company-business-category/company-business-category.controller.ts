import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'

import { Roles } from '@shared/decorators/roles.decorator'
import { GlobalRole } from '@shared/enums/global-role.enum'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { CreateCompanyBusinessCategoryDto } from './dtos/create-company-business-category.dto'
import { CompanyBusinessCategoryService } from './company-business-category.service'
import { CompanyBusinessCategoryWithCategory } from './company-business-category.repository'

@Controller('companies/:companyId/business-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompanyBusinessCategoryController {
  constructor(private readonly service: CompanyBusinessCategoryService) {}

  @Get()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT, GlobalRole.MERCHANT)
  getByCompanyId(
    @Param('companyId') companyId: string,
  ): Promise<CompanyBusinessCategoryWithCategory[]> {
    return this.service.getByCompanyId(companyId)
  }

  @Post()
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  link(
    @Param('companyId') companyId: string,
    @Body() body: CreateCompanyBusinessCategoryDto,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.service.link(companyId, body.businessCategoryId)
  }

  @Delete(':businessCategoryId')
  @HttpCode(204)
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  unlink(
    @Param('companyId') companyId: string,
    @Param('businessCategoryId') businessCategoryId: string,
  ): Promise<{ message: string }> {
    return this.service.unlink(companyId, businessCategoryId)
  }

  @Patch(':businessCategoryId/activate')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  activate(
    @Param('companyId') companyId: string,
    @Param('businessCategoryId') businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.service.activate(companyId, businessCategoryId)
  }

  @Patch(':businessCategoryId/deactivate')
  @Roles(GlobalRole.ADMIN, GlobalRole.SUPPORT)
  deactivate(
    @Param('companyId') companyId: string,
    @Param('businessCategoryId') businessCategoryId: string,
  ): Promise<CompanyBusinessCategoryWithCategory> {
    return this.service.deactivate(companyId, businessCategoryId)
  }
}
