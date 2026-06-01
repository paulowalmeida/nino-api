import {
  IsArray,
  IsBoolean,
  IsDateString,
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

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string

  @IsUUID()
  @IsNotEmpty()
  statusId: string

  @IsUUID()
  @IsOptional()
  customerId?: string

  @IsUUID()
  @IsOptional()
  deliveryAddressId?: string

  @IsBoolean()
  isDelivery: boolean

  @IsNumber()
  @Min(0)
  deliveryFee: number

  @IsString()
  @IsOptional()
  notes?: string

  @IsDateString()
  @IsOptional()
  estimatedDeliveryAt?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  loyaltyPointsUsed?: number

  @IsNumber()
  @Min(0)
  @IsOptional()
  loyaltyDiscount?: number

  @IsString()
  @IsOptional()
  guestName?: string

  @IsString()
  @IsOptional()
  guestPhone?: string

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]
}
