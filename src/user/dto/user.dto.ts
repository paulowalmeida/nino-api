import { IsOptional, IsString } from 'class-validator'

export class UserDto {
  @IsOptional()
  @IsString()
  firstName: string

  @IsOptional()
  @IsString()
  lastName: string

  @IsOptional()
  @IsString()
  companyName: string

  @IsOptional()
  @IsString()
  cpf: string
  
  @IsOptional()
  @IsString()
  cnpj: string
}
