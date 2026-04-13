import { IsInt } from 'class-validator'

export class UpdateRoleDTO {
  @IsInt()
  roleId: number
}
