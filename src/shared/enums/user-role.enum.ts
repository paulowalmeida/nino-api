export enum UserRole {
  UNSPECIFIED = 0,
  /** ADMIN - Dono da Plataforma (Você) */
  ADMIN = 1,
  /** SUPPORT - Suporte Técnico */
  SUPPORT = 2,
  /** MERCHANT - Dono do Restaurante */
  MERCHANT = 3,
  /** CUSTOMER - Cliente Final */
  CUSTOMER = 4,
  /** COURIER - Entregador */
  COURIER = 5,
  /** GUEST - Usuário Convidado (sem cadastro) */
  GUEST = 6,
  UNRECOGNIZED = -1,
}
