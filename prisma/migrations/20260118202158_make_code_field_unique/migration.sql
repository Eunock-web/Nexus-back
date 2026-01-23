/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `OtpModel` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "OtpModel_code_key" ON "OtpModel"("code");
