import { registerDecorator } from 'class-validator'

import { IsCnpj, IsCnpjConstraint } from './cnpj.validator'

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  registerDecorator: jest.fn(),
  ValidatorConstraint: () => jest.fn(),
}))

describe('IsCnpjConstraint', () => {
  let constraint: IsCnpjConstraint

  beforeEach(() => {
    constraint = new IsCnpjConstraint()
  })

  it('should return true for a valid CNPJ string', () => {
    expect(constraint.validate('12.345.678/0001-95')).toBe(true)
  })

  it('should return false for a CNPJ with wrong length', () => {
    expect(constraint.validate('123.456.789/000')).toBe(false)
  })

  it('should return false for a non-string value', () => {
    expect(constraint.validate(12345678000195)).toBe(false)
  })

  it('should return the default error message', () => {
    expect(constraint.defaultMessage()).toBe('Invalid CNPJ format')
  })
})

describe('IsCnpj decorator', () => {
  it('should call registerDecorator with correct arguments', () => {
    class TestClass {
      cnpj: string
    }

    IsCnpj()(TestClass.prototype, 'cnpj')

    expect(registerDecorator).toHaveBeenCalledWith(
      expect.objectContaining({
        target: TestClass,
        propertyName: 'cnpj',
        validator: IsCnpjConstraint,
      }),
    )
  })
})
