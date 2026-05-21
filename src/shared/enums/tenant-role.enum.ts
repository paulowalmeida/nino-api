export enum TenantRole {
  OWNER = 'OWNER', // dono da loja — acesso total à unidade, pode ser o próprio MERCHANT ou delegado
  MANAGER = 'MANAGER', // gerente operacional — dia a dia sem controle financeiro
  STAFF = 'STAFF', // colaborador genérico — execução operacional sem acesso a configurações
}
