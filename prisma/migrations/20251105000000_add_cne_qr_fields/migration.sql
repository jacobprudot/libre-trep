-- AlterEnum
ALTER TYPE "ActaType" RENAME TO "ActaType_old";
CREATE TYPE "ActaType" AS ENUM ('PRESIDENTIAL', 'DEPUTIES', 'MAYORS');
ALTER TABLE "actas" ALTER COLUMN "type" TYPE "ActaType" USING (
  CASE "type"::text
    WHEN 'PRESIDENCIAL' THEN 'PRESIDENTIAL'
    WHEN 'DEPARTAMENTAL' THEN 'DEPUTIES'
    WHEN 'MUNICIPAL' THEN 'MAYORS'
  END
)::"ActaType";
DROP TYPE "ActaType_old";

-- AlterTable: Update Delegate model with CNE QR fields
ALTER TABLE "delegates"
  RENAME COLUMN "qrCode" TO "qrCodeEncrypted";

ALTER TABLE "delegates"
  ADD COLUMN "qrCodeDecrypted" TEXT,
  ADD COLUMN "partyCode" TEXT,
  ADD COLUMN "jrvNumber" TEXT,
  ADD COLUMN "docType" TEXT,
  ADD COLUMN "cargoCode" TEXT,
  ADD COLUMN "cargoName" TEXT,
  ADD COLUMN "cargoType" TEXT,
  ADD COLUMN "canVote" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable: Update Party model with CNE codes
ALTER TABLE "parties"
  ADD COLUMN "cneCode" TEXT,
  ADD COLUMN "shortName" TEXT;

-- Update existing parties with CNE codes (if any exist)
UPDATE "parties" SET "cneCode" = '02', "shortName" = 'LIBRE' WHERE "code" = 'LIBRE';
UPDATE "parties" SET "cneCode" = '05', "shortName" = 'PNH' WHERE "code" = 'PN';
UPDATE "parties" SET "cneCode" = '04', "shortName" = 'PLH' WHERE "code" = 'PL';
UPDATE "parties" SET "cneCode" = '03', "shortName" = 'PINU' WHERE "code" = 'PINU';
UPDATE "parties" SET "cneCode" = '01', "shortName" = 'DC' WHERE "code" = 'DC';

-- Make cneCode and shortName required after updating
ALTER TABLE "parties"
  ALTER COLUMN "cneCode" SET NOT NULL,
  ALTER COLUMN "shortName" SET NOT NULL;

-- CreateTable: CargoJRV catalog
CREATE TABLE "cargos_jrv" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "canVote" BOOLEAN NOT NULL DEFAULT true,
    "timeRestriction" TEXT NOT NULL DEFAULT '1:00PM',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cargos_jrv_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "delegates_qrCodeEncrypted_key" ON "delegates"("qrCodeEncrypted");
CREATE INDEX "delegates_qrCodeDecrypted_idx" ON "delegates"("qrCodeDecrypted");
CREATE INDEX "delegates_partyCode_idx" ON "delegates"("partyCode");
CREATE INDEX "delegates_jrvNumber_idx" ON "delegates"("jrvNumber");
CREATE INDEX "delegates_cargoCode_idx" ON "delegates"("cargoCode");

CREATE UNIQUE INDEX "parties_cneCode_key" ON "parties"("cneCode");

CREATE UNIQUE INDEX "cargos_jrv_code_key" ON "cargos_jrv"("code");
