import { CnpjService } from '@shared/services/cnpj/cnpj.service'
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ name: 'IsCnpj', async: false })
export class IsCnpjConstraint implements ValidatorConstraintInterface {
  validate(value: any): boolean {
    return typeof value === 'string' && CnpjService.isValidCnpjFormat(value)
  }

  defaultMessage(): string {
    return 'Invalid CNPJ format'
  }
}

export function IsCnpj(options?: ValidationOptions) {
  return function (target: Object, propertyName: string): void {
    registerDecorator({
      target: target.constructor,
      propertyName,
      options,
      constraints: [],
      validator: IsCnpjConstraint,
    })
  }
}
