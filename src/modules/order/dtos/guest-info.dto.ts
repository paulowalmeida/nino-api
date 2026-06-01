import { IsEmail, IsOptional, IsString } from 'class-validator'

export class GuestInfoDto {
  @IsEmail()
  @IsOptional()
  guestEmail?: string

  @IsString()
  @IsOptional()
  guestCpf?: string

  @IsString()
  @IsOptional()
  guestZipCode?: string

  @IsString()
  @IsOptional()
  guestStreet?: string

  @IsString()
  @IsOptional()
  guestNumber?: string

  @IsString()
  @IsOptional()
  guestComplement?: string

  @IsString()
  @IsOptional()
  guestNeighborhood?: string

  @IsString()
  @IsOptional()
  guestCity?: string

  @IsString()
  @IsOptional()
  guestState?: string
}
