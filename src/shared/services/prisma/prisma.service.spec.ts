import { ConfigService } from '@nestjs/config'

import { PrismaService } from './prisma.service'

jest.mock('pg', () => ({ Pool: jest.fn().mockImplementation(() => ({})) }))
jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}))
jest.mock('@prisma/client', () => {
  const mockConnect = jest.fn().mockResolvedValue(undefined)
  const mockDisconnect = jest.fn().mockResolvedValue(undefined)
  class PrismaClient {
    $connect = mockConnect
    $disconnect = mockDisconnect
    constructor(_opts?: unknown) {}
  }
  return { PrismaClient }
})

describe(PrismaService.name, () => {
  const makeConfig = (url: string | undefined) =>
    ({ get: jest.fn().mockReturnValue(url) }) as unknown as ConfigService

  it('should throw when DB_URL is not set', () => {
    expect(() => new PrismaService(makeConfig(undefined))).toThrow(
      'DB_URL não encontrada no .env',
    )
  })

  it('should create an instance when DB_URL is set', () => {
    expect(
      () => new PrismaService(makeConfig('postgresql://localhost/test')),
    ).not.toThrow()
  })

  it('should call $connect on onModuleInit', async () => {
    const service = new PrismaService(makeConfig('postgresql://localhost/test'))
    await service.onModuleInit()
    expect(service.$connect).toHaveBeenCalled()
  })

  it('should call $disconnect on onModuleDestroy', async () => {
    const service = new PrismaService(makeConfig('postgresql://localhost/test'))
    await service.onModuleDestroy()
    expect(service.$disconnect).toHaveBeenCalled()
  })
})
