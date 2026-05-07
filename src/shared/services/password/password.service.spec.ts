import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PasswordService } from './password.service'

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

import * as bcrypt from 'bcrypt'

describe('PasswordService', () => {
  let service: PasswordService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile()

    service = module.get<PasswordService>(PasswordService)
    jest.clearAllMocks()
  })

  it('should hash a password', async () => {
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed')
    const result = await service.hash('password')
    expect(bcrypt.hash).toHaveBeenCalledWith('password', 10)
    expect(result).toBe('hashed')
  })

  it('should return true when passwords match', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    const result = await service.compare('password', 'hash')
    expect(result).toBe(true)
  })

  it('should return false when passwords do not match', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    const result = await service.compare('wrong', 'hash')
    expect(result).toBe(false)
  })

  it('should resolve when password is valid', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    await expect(service.validate('password', 'hash')).resolves.toBeUndefined()
  })

  it('should throw UnauthorizedException when password is invalid', async () => {
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)
    await expect(service.validate('wrong', 'hash')).rejects.toThrow(
      UnauthorizedException,
    )
  })
})
