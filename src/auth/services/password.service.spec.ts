import { UnauthorizedException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'

import { PasswordService } from '@auth/services/password.service'

const mockHash = jest.fn<Promise<string>>()
const mockCompare = jest.fn<Promise<boolean>>()

jest.mock('bcrypt', () => ({
  get hash() {
    return mockHash
  },
  get compare() {
    return mockCompare
  },
}))

describe('PasswordService', () => {
  let service: PasswordService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile()

    service = module.get<PasswordService>(PasswordService)
    jest.clearAllMocks()
  })

  it('should hash password using bcrypt with salt rounds of 10', async () => {
    mockHash.mockResolvedValue('hashed-password')

    const result = await service.hash('my-password')

    expect(result).toEqual('hashed-password')
    expect(mockHash).toHaveBeenCalledWith('my-password', 10)
  })

  it('should compare password and return true when they match', async () => {
    mockCompare.mockResolvedValue(true)

    const result = await service.compare('my-password', 'hashed-password')

    expect(result).toEqual(true)
    expect(mockCompare).toHaveBeenCalledWith('my-password', 'hashed-password')
  })

  it('should compare password and return false when they do not match', async () => {
    mockCompare.mockResolvedValue(false)

    const result = await service.compare('wrong-password', 'hashed-password')

    expect(result).toEqual(false)
  })

  it('should throw UnauthorizedException when password does not match hash', async () => {
    mockCompare.mockResolvedValue(false)

    await expect(
      service.validate('wrong', 'hashed-value'),
    ).rejects.toThrow(UnauthorizedException)
  })

  it('should not throw when password matches hash', async () => {
    mockCompare.mockResolvedValue(true)

    await expect(
      service.validate('my-password', 'hashed-value'),
    ).resolves.toBeUndefined()
  })
})
