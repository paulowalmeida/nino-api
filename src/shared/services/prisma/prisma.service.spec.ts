import { Test, TestingModule } from '@nestjs/testing'
import { ConfigService } from '@nestjs/config'

import { PrismaService } from './prisma.service'

describe('PrismaService', () => {
  let service: PrismaService
  let configService: jest.Mocked<ConfigService>

  const mockConfig = {
    get: jest.fn().mockReturnValue('postgresql://localhost'),
  }

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile()

    service = module.get<PrismaService>(PrismaService)
    configService = module.get(ConfigService)

    service.$connect = jest.fn().mockResolvedValue(undefined)
    service.$disconnect = jest.fn().mockResolvedValue(undefined)
  })

  describe('PrismaService Unit Tests', () => {
    it('should call $connect on module init', async () => {
      await service.onModuleInit()
      expect(service.$connect).toHaveBeenCalled()
    })

    it('should call $disconnect on module destroy', async () => {
      await service.onModuleDestroy()
      expect(service.$disconnect).toHaveBeenCalled()
    })

    it('should throw error if DB_URL is not defined', () => {
      mockConfig.get.mockReturnValue(undefined)
      expect(() => new PrismaService(configService)).toThrow()
    })
  })
})
