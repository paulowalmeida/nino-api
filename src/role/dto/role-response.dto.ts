import { ApiProperty } from '@nestjs/swagger'

export class RoleResponse {
  @ApiProperty({ example: 2 }) id: number
  @ApiProperty({ example: 'OWNER' }) description: string
}
