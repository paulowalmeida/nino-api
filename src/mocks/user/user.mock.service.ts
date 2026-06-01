import { Injectable } from '@nestjs/common'
import {
  CORP_PREFIX,
  CORP_SUFFIX,
  DOMAINS,
  FIRST_NAMES,
  LAST_NAMES,
  TIMEZONES,
} from 'src/mocks/data/user.data.mock'
import { CnpjMockService } from '../cnpj/cnpj.mock.service'

@Injectable()
export class UserMockService {
  pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

  getOneMock() {
    return this.generateFakeUser()
  }

  findManyMocks(count: number) {
    // Trava pragmática: limita a 10 para não travar o Event Loop da API
    const safeCount = count ?? 10
    return this.generateMassiveUserData(safeCount)
  }

  private generateFakeUser = () => {
    const firstName = this.pick(FIRST_NAMES)
    const lastName = this.pick(LAST_NAMES)
    const id = Math.floor(Math.random() * 999999)

    return {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@${this.pick(DOMAINS)}`,
      password: 'Senha123*',
      globalRoleId: 1,
      companyName: `${this.pick(CORP_PREFIX)} ${this.pick(CORP_SUFFIX)} ${id}`,
      cnpj: CnpjMockService.generateFakeCnpj(),
      isActive: true,
      locale: 'pt-br',
      timezone: this.pick(TIMEZONES),
    }
  }

  private generateMassiveUserData = (count: number) => {
    return Array.from({ length: count }, () => this.generateFakeUser())
  }
}
