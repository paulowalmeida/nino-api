import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateNotificationTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}