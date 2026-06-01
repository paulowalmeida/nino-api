import {
  IsArray,
  IsBoolean,
  IsDateString,
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
import { GuestInfoDto } from './guest-info.dto'

export class CreateOrderDto extends GuestInfoDto {
  @IsUUID()
  @IsNotEmpty()
  tenantId: string

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

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]
}
