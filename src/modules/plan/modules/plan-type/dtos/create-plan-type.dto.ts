import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreatePlanTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
