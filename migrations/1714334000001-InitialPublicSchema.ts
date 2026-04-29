import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialPublicSchema1714334000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create roles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."roles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" varchar NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create companies table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."companies" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_name" varchar NOT NULL,
        "cnpj" varchar UNIQUE NOT NULL,
        "legal_name" varchar,
        "legal_nature" varchar,
        "state_registration" varchar,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create users table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL,
        "role_id" uuid NOT NULL REFERENCES "public"."roles"("id") ON DELETE CASCADE,
        "company_id" uuid REFERENCES "public"."companies"("id") ON DELETE SET NULL,
        "is_active" boolean DEFAULT true,
        "last_login_at" timestamp,
        "locale" varchar,
        "timezone" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    await queryRunner.query(`
      ALTER TABLE "public"."users"
      ADD COLUMN IF NOT EXISTS "company_id" uuid REFERENCES "public"."companies"("id") ON DELETE SET NULL
    `)

    // Create credentials table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."credentials" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL UNIQUE REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "email" varchar UNIQUE NOT NULL,
        "password" varchar NOT NULL,
        "provider" varchar DEFAULT 'local',
        "provider_id" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create sessions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."sessions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "refresh_token" varchar UNIQUE NOT NULL,
        "ip_address" varchar,
        "user_agent" varchar,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create plan_types table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."plan_types" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create plans table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."plans" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "slug" varchar UNIQUE NOT NULL,
        "type_id" uuid REFERENCES "public"."plan_types"("id"),
        "price" numeric(10, 2),
        "max_tenants" integer,
        "max_products" integer,
        "max_orders" integer,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create subscription_statuses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."subscription_statuses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create subscriptions table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL UNIQUE REFERENCES "public"."companies"("id") ON DELETE CASCADE,
        "plan_id" uuid NOT NULL REFERENCES "public"."plans"("id"),
        "subscription_status_id" uuid NOT NULL REFERENCES "public"."subscription_statuses"("id"),
        "started_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "expires_at" timestamp,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create invoice_statuses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."invoice_statuses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create invoices table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."invoices" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "subscription_id" uuid NOT NULL REFERENCES "public"."subscriptions"("id"),
        "invoice_status_id" uuid NOT NULL REFERENCES "public"."invoice_statuses"("id"),
        "amount" numeric(10, 2),
        "due_date" timestamp,
        "paid_at" timestamp,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create company_responsibles table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."company_responsibles" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL UNIQUE REFERENCES "public"."companies"("id") ON DELETE CASCADE,
        "name" varchar NOT NULL,
        "cpf" varchar UNIQUE NOT NULL,
        "email" varchar,
        "phone" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create tenants table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."tenants" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "company_id" uuid NOT NULL REFERENCES "public"."companies"("id") ON DELETE CASCADE,
        "slug" varchar UNIQUE NOT NULL,
        "logo_url" varchar,
        "favicon" varchar,
        "primary_color" varchar,
        "secondary_color" varchar,
        "custom_domain" varchar UNIQUE,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create tenant_statuses table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."tenant_statuses" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create notification_types table
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."notification_types" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar NOT NULL UNIQUE,
        "description" varchar,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Create user_tenants table (many-to-many with composite PK)
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "public"."user_tenants" (
        "user_id" uuid NOT NULL REFERENCES "public"."users"("id") ON DELETE CASCADE,
        "tenant_id" uuid NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY ("user_id", "tenant_id")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop tables in reverse order
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."user_tenants"`)
    await queryRunner.query(
      `DROP TABLE IF EXISTS "public"."notification_types"`,
    )
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."tenant_statuses"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."tenants"`)
    await queryRunner.query(
      `DROP TABLE IF EXISTS "public"."company_responsibles"`,
    )
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."invoices"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."invoice_statuses"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."subscriptions"`)
    await queryRunner.query(
      `DROP TABLE IF EXISTS "public"."subscription_statuses"`,
    )
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."plan_types"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."plans"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."sessions"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."credentials"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."users"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."companies"`)
    await queryRunner.query(`DROP TABLE IF EXISTS "public"."roles"`)
  }
}
