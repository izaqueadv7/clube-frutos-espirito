-- AlterTable
ALTER TABLE "users" ADD COLUMN     "birthDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "specialty_requirements" (
    "id" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "specialty_requirements_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "specialty_requirements" ADD CONSTRAINT "specialty_requirements_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
