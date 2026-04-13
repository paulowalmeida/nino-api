import { IsUUID } from 'class-validator'

export class UpdateRoleDTO {
  @IsUUID()
  roleId: string
}
