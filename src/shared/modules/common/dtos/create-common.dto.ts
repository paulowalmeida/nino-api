import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateCommonDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsOptional()
  description?: string
}
