-- AlterTable
ALTER TABLE "actas" ADD COLUMN     "biometricCount" INTEGER,
ADD COLUMN     "blankVotes" INTEGER,
ADD COLUMN     "jrvId" TEXT,
ADD COLUMN     "nullVotes" INTEGER,
ADD COLUMN     "signaturesCount" INTEGER,
ADD COLUMN     "totalVoters" INTEGER,
ADD COLUMN     "validBallots" INTEGER;

-- AlterTable
ALTER TABLE "municipalities" ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "voting_centers" ADD COLUMN     "areaCode" INTEGER,
ADD COLUMN     "areaName" TEXT,
ADD COLUMN     "jrvCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sectorCode" INTEGER,
ADD COLUMN     "sectorName" TEXT,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "latitude" DROP NOT NULL,
ALTER COLUMN "longitude" DROP NOT NULL,
ALTER COLUMN "registeredVoters" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "jrvs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "centerId" TEXT NOT NULL,
    "members" INTEGER NOT NULL DEFAULT 3,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jrvs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "jrvs_code_key" ON "jrvs"("code");

-- CreateIndex
CREATE INDEX "jrvs_centerId_idx" ON "jrvs"("centerId");

-- CreateIndex
CREATE INDEX "actas_jrvId_idx" ON "actas"("jrvId");

-- AddForeignKey
ALTER TABLE "jrvs" ADD CONSTRAINT "jrvs_centerId_fkey" FOREIGN KEY ("centerId") REFERENCES "voting_centers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actas" ADD CONSTRAINT "actas_jrvId_fkey" FOREIGN KEY ("jrvId") REFERENCES "jrvs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
