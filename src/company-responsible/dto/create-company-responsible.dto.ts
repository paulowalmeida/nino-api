import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  IsUUID,
} from 'class-validator'

export class CreateCompanyResponsibleDto {
  @IsUUID()
  @IsNotEmpty()
  companyId: string

  @IsString()
  name: string

  @IsString()
  cpf: string

  @IsPhoneNumber()
  phone: string

  @IsEmail()
  email: string
}
