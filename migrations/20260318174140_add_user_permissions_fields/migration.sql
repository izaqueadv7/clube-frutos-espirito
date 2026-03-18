-- AlterTable
ALTER TABLE "users" ADD COLUMN     "canManageContent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "canManageUsers" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isMedia" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "primaryFunction" TEXT,
ADD COLUMN     "secondaryFunction" TEXT;
