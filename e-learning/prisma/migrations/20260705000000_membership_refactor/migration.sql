-- Membership Refactor Migration
-- Replaces User.role (global) with Membership (contextual multi-role)
-- Old roles: LEARNER, INSTRUCTOR, ADMIN_INSTITUTION, SUPER_ADMIN
-- New roles: LEARNER, CREATOR, MANAGER, ADMIN, SUPER_ADMIN
--
-- Pre-condition (from a partial db push attempt):
--   - ContextType enum already exists (INDIVIDUAL, ORGANIZATION, PLATFORM)
--   - Role enum still has old values (LEARNER, INSTRUCTOR, ADMIN_INSTITUTION, SUPER_ADMIN)
--   - User.role and User.organizationId still exist

-- Step 1: Drop the typed default on User.role (prevents type change)
ALTER TABLE "User" ALTER COLUMN role DROP DEFAULT;

-- Step 2: Create intermediate Role enum containing ALL values (old + new)
-- PostgreSQL cannot use ADD VALUE in the same transaction, so we create a new type
CREATE TYPE "Role_v2" AS ENUM (
  'LEARNER', 'INSTRUCTOR', 'ADMIN_INSTITUTION',
  'CREATOR', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'
);

-- Step 3: Cast columns to the intermediate type
ALTER TABLE "User"
  ALTER COLUMN role TYPE "Role_v2" USING role::text::"Role_v2";
ALTER TABLE "role_permission"
  ALTER COLUMN role TYPE "Role_v2" USING role::text::"Role_v2";

-- Step 4: Migrate existing rows to new role names
UPDATE "User"            SET role = 'CREATOR' WHERE role = 'INSTRUCTOR';
UPDATE "User"            SET role = 'ADMIN'   WHERE role = 'ADMIN_INSTITUTION';
UPDATE "role_permission" SET role = 'CREATOR' WHERE role = 'INSTRUCTOR';
UPDATE "role_permission" SET role = 'ADMIN'   WHERE role = 'ADMIN_INSTITUTION';

-- Step 5: Create the final clean Role enum
CREATE TYPE "Role_final" AS ENUM ('LEARNER', 'CREATOR', 'MANAGER', 'ADMIN', 'SUPER_ADMIN');

-- Step 6: Cast columns to the final type (all rows now use valid final values)
ALTER TABLE "User"
  ALTER COLUMN role TYPE "Role_final" USING role::text::"Role_final";
ALTER TABLE "role_permission"
  ALTER COLUMN role TYPE "Role_final" USING role::text::"Role_final";

-- Step 7: Drop old enums and rename final to "Role"
DROP TYPE "Role";
DROP TYPE "Role_v2";
ALTER TYPE "Role_final" RENAME TO "Role";

-- Step 8: Create ContextType enum
-- On the real DB this was created by an earlier db push; on a fresh/shadow DB it must be created here.
DO $$ BEGIN
  CREATE TYPE "ContextType" AS ENUM ('INDIVIDUAL', 'ORGANIZATION', 'PLATFORM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Step 9: Create membership table
CREATE TABLE "membership" (
    "id"          TEXT          NOT NULL,
    "userId"      TEXT          NOT NULL,
    "contextType" "ContextType" NOT NULL,
    "contextId"   TEXT,
    "role"        "Role"        NOT NULL,
    "createdAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "membership_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "membership"
  ADD CONSTRAINT "membership_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- NULLS NOT DISTINCT: (userId, INDIVIDUAL, NULL) is truly unique (PostgreSQL 15+)
CREATE UNIQUE INDEX "membership_userId_contextType_contextId_key"
  ON "membership"("userId", "contextType", "contextId") NULLS NOT DISTINCT;

-- Step 10: Data migration — INDIVIDUAL memberships for all non-deleted users
INSERT INTO "membership" ("id", "userId", "contextType", "contextId", "role", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    "id",
    'INDIVIDUAL'::"ContextType",
    NULL,
    role,
    NOW(),
    NOW()
FROM "User"
WHERE "deletedAt" IS NULL;

-- Step 11: Data migration — PLATFORM membership for SUPER_ADMIN users
INSERT INTO "membership" ("id", "userId", "contextType", "contextId", "role", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    "id",
    'PLATFORM'::"ContextType",
    NULL,
    'SUPER_ADMIN'::"Role",
    NOW(),
    NOW()
FROM "User"
WHERE role = 'SUPER_ADMIN' AND "deletedAt" IS NULL;

-- Step 12: Data migration — ORGANIZATION membership for users with an organizationId
INSERT INTO "membership" ("id", "userId", "contextType", "contextId", "role", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    "id",
    'ORGANIZATION'::"ContextType",
    "organizationId",
    role,
    NOW(),
    NOW()
FROM "User"
WHERE "organizationId" IS NOT NULL AND "deletedAt" IS NULL;

-- Step 13: Clear role_permission rows — seed.ts recreates them with new role names
DELETE FROM "role_permission";

-- Step 14: Drop legacy columns from User
ALTER TABLE "User" DROP COLUMN "role";
ALTER TABLE "User" DROP COLUMN "organizationId";
