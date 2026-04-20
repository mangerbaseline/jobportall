/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `PersonalDetail` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `ProfessionalDetail` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PersonalDetail_userId_key" ON "PersonalDetail"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProfessionalDetail_userId_key" ON "ProfessionalDetail"("userId");
