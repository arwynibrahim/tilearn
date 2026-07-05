-- Remove the DB-level DEFAULT from membership.updatedAt
-- Prisma manages @updatedAt at the client level, not via a database default.
ALTER TABLE "membership" ALTER COLUMN "updatedAt" DROP DEFAULT;
