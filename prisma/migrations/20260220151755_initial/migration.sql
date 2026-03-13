-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "personal_data" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "birthDate" TIMESTAMP(3),

    CONSTRAINT "personal_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hashedRefreshToken" TEXT,
    "roleId" TEXT NOT NULL,
    "personalDataId" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_code_key" ON "user_roles"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_description_key" ON "user_roles"("description");

-- CreateIndex
CREATE UNIQUE INDEX "personal_data_email_key" ON "personal_data"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_personalDataId_key" ON "users"("personalDataId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "user_roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_personalDataId_fkey" FOREIGN KEY ("personalDataId") REFERENCES "personal_data"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
