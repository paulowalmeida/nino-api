import { IsString } from 'class-validator'

export class CreateCompanyDto {
  @IsString()
  companyName: string

  @IsString()
  cnpj: string
}
