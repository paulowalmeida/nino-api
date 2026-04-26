import { Injectable } from "@nestjs/common";

@Injectable()
export class CnpjService {
  
  /* Valida o formato do CNPJ */
  static  isValidCnpjFormat(cnpj: string): boolean {
  if (!cnpj) return false;

  // Remove caracteres especiais (. / -)
  const cleanCnpj = cnpj.replace(/[^\w]/g, '');

  if (cleanCnpj.length !== 14) return false;

  // Regex: 12 alfanuméricos + 2 numéricos
  const pattern = /^[a-z0-9]{12}\d{2}$/i;

  return pattern.test(cleanCnpj);
}
}