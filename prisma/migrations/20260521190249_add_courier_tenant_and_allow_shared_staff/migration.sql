-- AlterTable
ALTER TABLE "tenant_settings" ADD COLUMN     "allow_shared_staff" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "courier_tenants" (
    "courier_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "courier_tenants_pkey" PRIMARY KEY ("courier_id","tenant_id")
);

-- AddForeignKey
ALTER TABLE "courier_tenants" ADD CONSTRAINT "courier_tenants_courier_id_fkey" FOREIGN KEY ("courier_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courier_tenants" ADD CONSTRAINT "courier_tenants_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
