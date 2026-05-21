import { Test, TestingModule } from '@nestjs/testing'
import { HealthCheckService } from '@nestjs/terminus'

import { PrismaService } from '@shared/services/prisma/prisma.service'

import { HealthController } from './health.controller'

describe(HealthController.name, () => {
  let controller: HealthController

  const mockHealthResult = {
    status: 'ok',
    info: { database: { status: 'up' } },
    error: {},
    details: { database: { status: 'up' } },
  }

  const mockHealth: Pick<HealthCheckService, 'check'> = {
    check: jest.fn().mockResolvedValue(mockHealthResult),
  }

  const mockPrisma = {
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealth },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    controller = module.get<HealthController>(HealthController)
  })

  afterEach(() => jest.clearAllMocks())

  it('should return health check result', async () => {
    const result = await controller.check()
    expect(mockHealth.check).toHaveBeenCalledTimes(1)
    expect(result).toEqual(mockHealthResult)
  })

  it('should return database up when prisma query succeeds', async () => {
    await controller.check()
    const [indicators] = (mockHealth.check as jest.Mock).mock.calls[0]
    const result = await indicators[0]()
    expect(result).toEqual({ database: { status: 'up' } })
  })

  it('should throw HealthCheckError when prisma query fails', async () => {
    mockPrisma.$queryRaw.mockRejectedValueOnce(new Error('connection lost'))
    await controller.check()
    const [indicators] = (mockHealth.check as jest.Mock).mock.calls[0]
    await expect(indicators[0]()).rejects.toThrow('database')
  })
})
