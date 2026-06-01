import {
  IsArray,
  IsBoolean,
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

export class CreateGuestOrderDto extends GuestInfoDto {
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

  @IsString()
  @IsOptional()
  notes?: string

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[]
}
