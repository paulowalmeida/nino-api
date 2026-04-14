import { IsInt } from 'class-validator'

export class UserUpdateRoleDTO {
  @IsInt()
  roleId: number
}
