-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrganizationType" ADD VALUE 'BANK';
ALTER TYPE "OrganizationType" ADD VALUE 'INSTITUTE';
ALTER TYPE "OrganizationType" ADD VALUE 'SCHOOL';
ALTER TYPE "OrganizationType" ADD VALUE 'TRAINING_CENTER';
ALTER TYPE "OrganizationType" ADD VALUE 'ASSOCIATION';
ALTER TYPE "OrganizationType" ADD VALUE 'OTHER';
