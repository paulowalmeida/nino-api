export enum GlobalRole {
  ADMIN = 'ADMIN',       // time Nino — acesso total à plataforma, criado via banco
  SUPPORT = 'SUPPORT',   // time Nino — backoffice com restrição de dados, entra via invite
  MERCHANT = 'MERCHANT', // dono de empresa — acesso total aos seus tenants
  CUSTOMER = 'CUSTOMER', // consumidor final das lojas
  COURIER = 'COURIER',   // entregador autônomo — sem vínculo empregatício com a plataforma
  GUEST = 'GUEST',       // OAuth iniciado mas perfil incompleto — permissão única: completar cadastro
}
