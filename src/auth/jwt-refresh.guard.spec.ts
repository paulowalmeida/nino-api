import { Test, TestingModule } from '@nestjs/testing'

import { JwtRefreshGuard } from '@auth/jwt-refresh.guard'

describe('JwtRefreshGuard', () => {
  let guard: JwtRefreshGuard

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtRefreshGuard],
    }).compile()

    guard = module.get<JwtRefreshGuard>(JwtRefreshGuard)
  })

  it('should be defined', () => {
    expect(guard).toBeDefined()
  })

  it('should be an instance of JwtRefreshGuard', () => {
    expect(guard).toBeInstanceOf(JwtRefreshGuard)
  })
})
