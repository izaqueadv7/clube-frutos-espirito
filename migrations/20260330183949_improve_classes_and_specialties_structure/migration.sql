/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `classes` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `specialties` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "class_requirements" ADD COLUMN     "groupId" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "marker" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "classes" ADD COLUMN     "category" TEXT,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "pathfinder_progress" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "pathfinder_specialties" ADD COLUMN     "notes" TEXT;

-- AlterTable
ALTER TABLE "specialties" ADD COLUMN     "areaId" TEXT,
ADD COLUMN     "code" TEXT,
ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "slug" TEXT,
ADD COLUMN     "sourceUrl" TEXT;

-- AlterTable
ALTER TABLE "specialty_requirements" ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "marker" TEXT;

-- CreateTable
CREATE TABLE "specialty_areas" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "specialty_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pathfinder_specialty_requirement_progress" (
    "id" TEXT NOT NULL,
    "pathfinderSpecialtyId" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "pathfinder_specialty_requirement_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "class_groups" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "roman" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "class_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "specialty_areas_name_key" ON "specialty_areas"("name");

-- CreateIndex
CREATE UNIQUE INDEX "specialty_areas_slug_key" ON "specialty_areas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "pathfinder_specialty_requirement_progress_pathfinderSpecial_key" ON "pathfinder_specialty_requirement_progress"("pathfinderSpecialtyId", "requirementId");

-- CreateIndex
CREATE UNIQUE INDEX "classes_slug_key" ON "classes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "specialties_slug_key" ON "specialties"("slug");

-- AddForeignKey
ALTER TABLE "specialties" ADD CONSTRAINT "specialties_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "specialty_areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathfinder_specialty_requirement_progress" ADD CONSTRAINT "pathfinder_specialty_requirement_progress_pathfinderSpecia_fkey" FOREIGN KEY ("pathfinderSpecialtyId") REFERENCES "pathfinder_specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pathfinder_specialty_requirement_progress" ADD CONSTRAINT "pathfinder_specialty_requirement_progress_requirementId_fkey" FOREIGN KEY ("requirementId") REFERENCES "specialty_requirements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_groups" ADD CONSTRAINT "class_groups_classId_fkey" FOREIGN KEY ("classId") REFERENCES "classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_requirements" ADD CONSTRAINT "class_requirements_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "class_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;
