// Valor corresponde ao slug do plano — use findOneBy({ slug: Plan.STARTER })
export enum Plan {
  STARTER = 'starter',
  PRO = 'pro',
  BUSINESS = 'business',
  REDE = 'rede',
}
