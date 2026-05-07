import { Test, TestingModule } from '@nestjs/testing'

import { PaginationService } from './pagination.service'

describe('PaginationService', () => {
  let service: PaginationService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationService],
    }).compile()

    service = module.get<PaginationService>(PaginationService)
  })

  describe('getOptions', () => {
    it('should calculate skip and take from page and limit', () => {
      expect(service.getPaginationParams({ page: 2, size: 10 })).toEqual({
        skip: 10,
        take: 10,
      })
    })

    it('should default to page 1 and limit 20', () => {
      expect(service.getPaginationParams({})).toEqual({ skip: 0, take: 20 })
    })
  })

  describe('buildMeta', () => {
    it('should return null for previousPage on first page', () => {
      const meta = service.build(50, { page: 1, size: 10 })
      expect(meta.previousPage).toBeNull()
      expect(meta.nextPage).toBe(2)
    })

    it('should return null for nextPage on last page', () => {
      const meta = service.build(50, { page: 5, size: 10 })
      expect(meta.previousPage).toBe(4)
      expect(meta.nextPage).toBeNull()
    })

    it('should calculate totalPages correctly', () => {
      const meta = service.build(47, { page: 1, size: 10 })
      expect(meta.totalPages).toBe(5)
    })
  })

  describe('wrap', () => {
    it('should return data and pagination together', () => {
      const result = service.paginate(['a', 'b'], 2, { page: 1, size: 20 })
      expect(result.data).toEqual(['a', 'b'])
      expect(result.pagination.total).toBe(2)
      expect(result.pagination.totalPages).toBe(1)
    })
  })
})
