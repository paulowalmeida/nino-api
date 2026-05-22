import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'

import { CreateOrderItemDto } from './create-order-item.dto'

export class CreateGuestOrderDto {
  @IsUUID()
  tenantId: string

  @IsBoolean()
  isDelivery: boolean

  @IsNumber()
  @Min(0)
  @IsOptional()
  deliveryFee?: number

  @IsString()
  @IsNotEmpty()
  guestName: string

  @IsString()
  @IsNotEmpty()
  guestPhone: string

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

  @IsString()
  @IsOptional()
  notes?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]
}
