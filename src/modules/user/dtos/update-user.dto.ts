import { PartialType } from '@nestjs/swagger'

import { IsDateString, IsOptional } from 'class-validator'

import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsDateString()
  lastLoginAt?: Date | string
}
