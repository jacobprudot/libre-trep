-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('DELEGADO', 'COORDINADOR_DEPARTAMENTAL', 'COORDINADOR_NACIONAL', 'ANALISTA', 'ADMIN');

-- CreateEnum
CREATE TYPE "ActaType" AS ENUM ('PRESIDENCIAL', 'DEPARTAMENTAL', 'MUNICIPAL');

-- CreateEnum
CREATE TYPE "ActaStatus" AS ENUM ('PENDING', 'OCR_PROCESSING', 'OCR_COMPLETE', 'REQUIRES_REVIEW', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VoteSource" AS ENUM ('MANUAL', 'OCR');

-- CreateTable
CREATE TABLE "delegates" (
    "id" TEXT NOT NULL,
    "dni" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "deviceInfo" JSONB,
    "centerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "delegates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'DELEGADO',
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voting_centers" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "municipalityId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "registeredVoters" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voting_centers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actas" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "ActaType" NOT NULL,
    "delegateId" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "municipalityId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageHash" TEXT NOT NULL,
    "status" "ActaStatus" NOT NULL DEFAULT 'PENDING',
    "ocrProcessed" BOOLEAN NOT NULL DEFAULT false,
    "ocrConfidence" DOUBLE PRECISION,
    "ocrResults" JSONB,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "observations" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "actas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" TEXT NOT NULL,
    "actaId" TEXT NOT NULL,
    "partyId" TEXT NOT NULL,
    "votes" INTEGER NOT NULL,
    "source" "VoteSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "logo" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "userId" TEXT,
    "delegateId" TEXT,
    "changes" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_config" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delegates_dni_key" ON "delegates"("dni");

-- CreateIndex
CREATE UNIQUE INDEX "delegates_qrCode_key" ON "delegates"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "delegates_phone_key" ON "delegates"("phone");

-- CreateIndex
CREATE INDEX "delegates_dni_idx" ON "delegates"("dni");

-- CreateIndex
CREATE INDEX "delegates_qrCode_idx" ON "delegates"("qrCode");

-- CreateIndex
CREATE INDEX "delegates_phone_idx" ON "delegates"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "voting_centers_code_key" ON "voting_centers"("code");

-- CreateIndex
CREATE INDEX "voting_centers_code_idx" ON "voting_centers"("code");

-- CreateIndex
CREATE INDEX "voting_centers_departmentId_idx" ON "voting_centers"("departmentId");

-- CreateIndex
CREATE INDEX "voting_centers_municipalityId_idx" ON "voting_centers"("municipalityId");

-- CreateIndex
CREATE UNIQUE INDEX "departments_code_key" ON "departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "municipalities_code_key" ON "municipalities"("code");

-- CreateIndex
CREATE INDEX "municipalities_departmentId_idx" ON "municipalities"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "actas_code_key" ON "actas"("code");

-- CreateIndex
CREATE INDEX "actas_delegateId_idx" ON "actas"("delegateId");

-- CreateIndex
CREATE INDEX "actas_centerId_idx" ON "actas"("centerId");

-- CreateIndex
CREATE INDEX "actas_type_idx" ON "actas"("type");

-- CreateIndex
CREATE INDEX "actas_status_idx" ON "actas"("status");

-- CreateIndex
CREATE INDEX "actas_code_idx" ON "actas"("code");

-- CreateIndex
CREATE INDEX "votes_actaId_idx" ON "votes"("actaId");

-- CreateIndex
CREATE INDEX "votes_partyId_idx" ON "votes"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_actaId_partyId_source_key" ON "votes"("actaId", "partyId", "source");

-- CreateIndex
CREATE UNIQUE INDEX "parties_code_key" ON "parties"("code");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_delegateId_idx" ON "audit_logs"("delegateId");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "system_config_key_key" ON "system_config"("key");

-- AddForeignKey
ALTER TABLE "delegates" ADD CONSTRAINT "delegates_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "voting_centers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_centers" ADD CONSTRAINT "voting_centers_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voting_centers" ADD CONSTRAINT "voting_centers_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "delegates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "voting_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_municipalityId_fkey" FOREIGN KEY ("municipalityId") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_actaId_fkey" FOREIGN KEY ("actaId") REFERENCES "actas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "parties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_delegateId_fkey" FOREIGN KEY ("delegateId") REFERENCES "delegates"("id") ON DELETE SET NULL ON UPDATE CASCADE;
