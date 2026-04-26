import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateSubscriptionStatusDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}