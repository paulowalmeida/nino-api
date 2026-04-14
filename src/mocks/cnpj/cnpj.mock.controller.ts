import { Controller, Get, Param } from '@nestjs/common'
import { CnpjMockService } from './cnpj.mock.service'

@Controller('mock/cnpjs')
export class CnpjMockController {
  constructor(private readonly cnpjMockService: CnpjMockService) {}

  // GET /mock/cnpj
  @Get()
  getSingleCnpj() {
    return this.cnpjMockService.getOne()
  }

  // GET /mock/cnpj/massive?count=50
  @Get('/:quantity')
  getMassiveCnpj(@Param('quantity') quantity: number) {
    return this.cnpjMockService.getMany(quantity)
  }
}
