import { GlobalRole } from '@shared/enums/global-role.enum'
import { InvoiceStatus } from '@shared/enums/invoice-status.enum'
import { NotificationType } from '@shared/enums/notification-type.enum'
import { OrderStatus } from '@shared/enums/order-status.enum'
import { PaymentMethod } from '@shared/enums/payment-method.enum'
import { PaymentStatus } from '@shared/enums/payment-status.enum'
import { PlanType } from '@shared/enums/plan-type.enum'
import { Plan } from '@shared/enums/plan.enum'
import { SubscriptionStatus } from '@shared/enums/subscription-status.enum'
import { TenantRole } from '@shared/enums/tenant-role.enum'
import { TenantStatus } from '@shared/enums/tenant-status.enum'
import { TenantType } from '@shared/enums/tenant-type.enum'

export const globalRoles = [
  { name: GlobalRole.ADMIN, description: 'Dono da Plataforma' },
  { name: GlobalRole.SUPPORT, description: 'Suporte Técnico' },
  { name: GlobalRole.MERCHANT, description: 'Dono do Restaurante' },
  { name: GlobalRole.CUSTOMER, description: 'Cliente Final' },
  { name: GlobalRole.COURIER, description: 'Entregador' },
  { name: GlobalRole.GUEST, description: 'Usuário Convidado' },
]

export const tenantRoles = [
  { name: TenantRole.OWNER, description: 'Proprietário da unidade' },
  { name: TenantRole.MANAGER, description: 'Gerente' },
  { name: TenantRole.STAFF, description: 'Funcionário' },
]

export const tenantStatuses = [
  { name: TenantStatus.ACTIVE, description: 'Ativo' },
  { name: TenantStatus.INACTIVE, description: 'Inativo' },
  { name: TenantStatus.SUSPENDED, description: 'Suspenso' },
  { name: TenantStatus.PENDING, description: 'Pendente de ativação' },
]

export const subscriptionStatuses = [
  { name: SubscriptionStatus.ACTIVE, description: 'Ativo' },
  { name: SubscriptionStatus.INACTIVE, description: 'Inativo' },
  { name: SubscriptionStatus.TRIAL, description: 'Em avaliação' },
  { name: SubscriptionStatus.CANCELLED, description: 'Cancelado' },
  { name: SubscriptionStatus.PAST_DUE, description: 'Pagamento em atraso' },
]

export const invoiceStatuses = [
  { name: InvoiceStatus.PENDING, description: 'Pendente' },
  { name: InvoiceStatus.PAID, description: 'Pago' },
  { name: InvoiceStatus.OVERDUE, description: 'Vencida' },
  { name: InvoiceStatus.CANCELLED, description: 'Cancelada' },
]

export const notificationTypes = [
  { name: NotificationType.SYSTEM, description: 'Sistema' },
  { name: NotificationType.PROMOTION, description: 'Promoção' },
  { name: NotificationType.ORDER, description: 'Pedido' },
  { name: NotificationType.PAYMENT, description: 'Pagamento' },
  { name: NotificationType.USER, description: 'Usuário' },
]

export const planTypes = [
  { name: PlanType.MONTHLY, description: 'Plano Mensal' },
  { name: PlanType.YEARLY, description: 'Plano Anual' },
]

export const businessCategories = [
  { name: 'Pizzaria', description: 'Especializada em pizzas' },
  { name: 'Hamburgueria', description: 'Especializada em hambúrgueres' },
  { name: 'Japonesa', description: 'Culinária japonesa e sushi' },
  { name: 'Brasileira', description: 'Culinária tradicional brasileira' },
  { name: 'Italiana', description: 'Culinária italiana' },
  { name: 'Mexicana', description: 'Culinária mexicana' },
  { name: 'Árabe', description: 'Culinária árabe' },
  { name: 'Chinesa', description: 'Culinária chinesa' },
  { name: 'Churrascaria', description: 'Especializada em carnes e churrasco' },
  { name: 'Vegetariana', description: 'Opções vegetarianas e veganas' },
  {
    name: 'Frutos do Mar',
    description: 'Especializada em peixes e frutos do mar',
  },
  { name: 'Padaria e Café', description: 'Pães, doces e bebidas quentes' },
  { name: 'Sorveteria', description: 'Sorvetes e sobremesas geladas' },
  { name: 'Saudável', description: 'Alimentação saudável e fitness' },
  { name: 'Fast Food', description: 'Refeições rápidas e lanches' },
  { name: 'Doceria', description: 'Doces, bolos e confeitaria' },
  { name: 'Açaí', description: 'Açaí e smoothies' },
  { name: 'Tapiocaria', description: 'Especializada em tapiocas' },
  { name: 'Marmitaria', description: 'Refeições em marmita' },
  { name: 'Bar e Petiscos', description: 'Bebidas e petiscos' },
]

export const tenantTypes = [
  { name: TenantType.RESTAURANT, description: 'Restaurante tradicional' },
  { name: TenantType.FOOD_TRUCK, description: 'Food truck' },
  {
    name: TenantType.DARK_KITCHEN,
    description: 'Cozinha exclusiva para delivery',
  },
  { name: TenantType.FRANCHISE, description: 'Unidade franqueada' },
]

export const orderStatuses = [
  { name: OrderStatus.PENDING, description: 'Aguardando confirmação' },
  {
    name: OrderStatus.CONFIRMED,
    description: 'Confirmado pelo estabelecimento',
  },
  { name: OrderStatus.PREPARING, description: 'Em preparo' },
  { name: OrderStatus.READY, description: 'Pronto para retirada ou entrega' },
  { name: OrderStatus.OUT_FOR_DELIVERY, description: 'Saiu para entrega' },
  { name: OrderStatus.DELIVERED, description: 'Entregue' },
  { name: OrderStatus.CANCELLED, description: 'Cancelado' },
]

export const paymentStatuses = [
  { name: PaymentStatus.PENDING, description: 'Aguardando pagamento' },
  { name: PaymentStatus.PAID, description: 'Pago' },
  { name: PaymentStatus.FAILED, description: 'Falha no pagamento' },
  { name: PaymentStatus.REFUNDED, description: 'Estornado' },
  { name: PaymentStatus.CANCELLED, description: 'Cancelado' },
]

export const paymentMethods = [
  { name: PaymentMethod.CREDIT_CARD, description: 'Cartão de crédito' },
  { name: PaymentMethod.DEBIT_CARD, description: 'Cartão de débito' },
  { name: PaymentMethod.PIX, description: 'PIX' },
  { name: PaymentMethod.CASH, description: 'Dinheiro' },
  { name: PaymentMethod.VOUCHER, description: 'Vale-refeição ou alimentação' },
]

// typeId resolvido em runtime após upsert de planTypes
// maxOrders: null = ilimitado
export const plans = [
  {
    name: 'Starter',
    slug: Plan.STARTER,
    price: 97,
    maxTenants: 1,
    maxProducts: 50,
    maxOrders: 200,
    hasPrioritySupport: false,
  },
  {
    name: 'Pro',
    slug: Plan.PRO,
    price: 197,
    maxTenants: 3,
    maxProducts: 200,
    maxOrders: null,
    hasPrioritySupport: true,
  },
  {
    name: 'Business',
    slug: Plan.BUSINESS,
    price: 297,
    maxTenants: 10,
    maxProducts: 500,
    maxOrders: null,
    hasPrioritySupport: true,
  },
  {
    name: 'Rede',
    slug: Plan.REDE,
    price: 0,
    maxTenants: null,
    maxProducts: null,
    maxOrders: null,
    hasPrioritySupport: true,
  },
]
