import { JwtRefreshGuard } from './jwt-refresh.guard'

describe('JwtRefreshGuard', () => {
  describe('JwtRefreshGuard Unit Tests', () => {
    it('should be defined', () => {
      const guard = new JwtRefreshGuard()
      expect(guard).toBeDefined()
    })

    it('should instantiate correctly', () => {
      const guard = new JwtRefreshGuard()
      expect(guard).toBeInstanceOf(JwtRefreshGuard)
    })
  })
})
