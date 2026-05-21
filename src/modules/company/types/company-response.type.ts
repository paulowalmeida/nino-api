import { CompanyFull } from './company-full.type'

export type CompanyResponse = Omit<CompanyFull, 'ownerId' | 'responsibleId'>
