import { Injectable } from '@nestjs/common';

@Injectable()
export class CnpjMockService {
  getOne() {
    return { cnpj: CnpjMockService.generateFakeCnpj() };
  }

  findMany(count: number) {
    // Mesma trava de segurança para não explodir a memória
    const safeCount = count ?? 10
    
    return Array.from({ length: safeCount }, () => ({
      cnpj: CnpjMockService.generateFakeCnpj(),
    }));
  }

   static generateFakeCnpj = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const nums = '0123456789'

    let cnpj = ''

    // Gera os 12 primeiros caracteres (Raiz + Filial)
    for (let i = 0; i < 12; i++) {
      cnpj += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Gera os 2 últimos dígitos (DV)
    for (let i = 0; i < 2; i++) {
      cnpj += nums.charAt(Math.floor(Math.random() * nums.length))
    }

    return cnpj
  }
}