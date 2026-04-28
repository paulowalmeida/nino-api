export enum Role {
  UNRECOGNIZED = 'UNRECOGNIZED',
  UNSPECIFIED = 'UNSPECIFIED',
  /** Dono da Plataforma */
  ADMIN = 'ADMIN',
  /** Suporte Técnico */
  SUPPORT = 'SUPPORT',
  /** Dono do Restaurante */
  MERCHANT = 'MERCHANT',
  /** Cliente Final */
  CUSTOMER = 'CUSTOMER',
  /** Entregador */
  COURIER = 'COURIER',
  /** Usuário Convidado (sem cadastro) */
  GUEST = 'GUEST',
}
