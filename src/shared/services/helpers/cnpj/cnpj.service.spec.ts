import { CnpjService } from './cnpj.service'

describe('CnpjService', () => {
  it('should return false for empty string', () => {
    expect(CnpjService.isValidCnpjFormat('')).toBe(false)
  })

  it('should return false for null/undefined', () => {
    expect(CnpjService.isValidCnpjFormat(null as any)).toBe(false)
  })

  it('should return false when cleaned CNPJ has length != 14', () => {
    expect(CnpjService.isValidCnpjFormat('12.345.678/000')).toBe(false)
  })

  it('should return false when pattern does not match', () => {
    expect(CnpjService.isValidCnpjFormat('12.345.678/0001-XX')).toBe(false)
  })

  it('should return true for valid formatted CNPJ', () => {
    expect(CnpjService.isValidCnpjFormat('12.345.678/0001-95')).toBe(true)
  })

  it('should return true for valid unformatted CNPJ', () => {
    expect(CnpjService.isValidCnpjFormat('12345678000195')).toBe(true)
  })
})
