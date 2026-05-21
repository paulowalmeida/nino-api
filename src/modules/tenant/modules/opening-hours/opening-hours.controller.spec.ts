import { Test, TestingModule } from '@nestjs/testing'

import { OpeningHours } from '@prisma/client'

import { PaginatedQueryDto } from '@shared/dtos/paginated-query.dto'
import { JwtAuthGuard } from '@shared/guards/jwt-auth.guard'
import { RolesGuard } from '@shared/guards/roles.guard'
import { PaginationMeta } from '@shared/types/pagination-meta.type'

import { OpeningHoursController } from './opening-hours.controller'
import { OpeningHoursService } from './opening-hours.service'

describe(OpeningHoursController.name, () => {
  let controller: OpeningHoursController

  const mockOpeningHours: OpeningHours = {
    id: 'oh-1',
    tenantId: 'tenant-1',
    dayOfWeek: 1,
    openTime: '08:00',
    closeTime: '18:00',
    isOpen: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  }

  const mockMeta: PaginationMeta = {
    total: 1, page: 1, size: 10, totalPages: 1, previousPage: null, nextPage: null,
  }

  const mockService: Pick<
    OpeningHoursService,
    'getAll' | 'create' | 'update' | 'delete'
  > = {
    getAll: jest.fn().mockResolvedValue({ data: [mockOpeningHours], pagination: mockMeta }),
    create: jest.fn().mockResolvedValue(mockOpeningHours),
    update: jest.fn().mockResolvedValue(mockOpeningHours),
    delete: jest.fn().mockResolvedValue({ message: 'Deleted successfully' }),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OpeningHoursController],
      providers: [{ provide: OpeningHoursService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: () => true })
      .compile()

    controller = module.get<OpeningHoursController>(OpeningHoursController)
  })

  it('getAll() should return paginated opening hours for tenant', async () => {
    const query: PaginatedQueryDto = { page: 1, size: 10 }
    const result = await controller.getAll('tenant-1', query)
    expect(mockService.getAll).toHaveBeenCalledWith('tenant-1', query)
    expect(result.data).toEqual([mockOpeningHours])
    expect(result.pagination).toEqual(mockMeta)
  })

  it('create() should inject tenantId from param', async () => {
    const dto = { dayOfWeek: 1, openTime: '08:00', closeTime: '18:00' }
    const result = await controller.create('tenant-1', dto)
    expect(mockService.create).toHaveBeenCalledWith({
      ...dto,
      tenantId: 'tenant-1',
    })
    expect(result).toEqual(mockOpeningHours)
  })

  it('update() should update opening hours', async () => {
    const dto = { isOpen: false }
    const result = await controller.update('oh-1', dto)
    expect(mockService.update).toHaveBeenCalledWith('oh-1', dto)
    expect(result).toEqual(mockOpeningHours)
  })

  it('delete() should return success message', async () => {
    const result = await controller.delete('oh-1')
    expect(mockService.delete).toHaveBeenCalledWith('oh-1')
    expect(result).toEqual({ message: 'Deleted successfully' })
  })
})
