-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'INSPECTOR', 'CASHIER', 'INSURER_USER', 'AGENT');

-- CreateEnum
CREATE TYPE "InspectorStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('PRIVATE', 'PSV', 'COMMERCIAL', 'SCHOOL', 'DRIVING_SCHOOL', 'GOVERNMENT', 'TRAILER', 'MOTORCYCLE', 'THREE_WHEELER');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('IN_PROGRESS', 'PASSED', 'FAILED', 'ABORTED');

-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('ANNUAL', 'PRIVATE_OVER_4YRS', 'SCHOOL', 'PRE_REGISTRATION', 'ACCIDENT', 'CHANGE_OF_PARTICULARS', 'POLICE', 'RE_REGISTRATION', 'SALVAGE_B');

-- CreateEnum
CREATE TYPE "ItemGroup" AS ENUM ('BRAKES', 'STRUCTURE', 'EMISSIONS', 'SUSPENSION_STEERING', 'LIGHTING_ELECTRICAL', 'TYRES', 'COMPLIANCE_DEVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "ResultSeverity" AS ENUM ('INFO', 'MINOR', 'MAJOR', 'DANGEROUS');

-- CreateEnum
CREATE TYPE "DefectSeverity" AS ENUM ('NONE', 'MINOR', 'MAJOR', 'DANGEROUS');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('PHOTO_FRONT', 'PHOTO_REAR', 'PHOTO_ODOMETER', 'PHOTO_UNDERBODY', 'VIDEO_CLIP', 'OTHER');

-- CreateEnum
CREATE TYPE "InsurerStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'INACTIVE');

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "county" TEXT,
    "cluster" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspector" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "licenceNo" TEXT NOT NULL,
    "licenceExpiry" TIMESTAMP(3) NOT NULL,
    "qualification" TEXT,
    "yearsExperience" INTEGER,
    "status" "InspectorStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Inspector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Owner" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "idNo" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,

    CONSTRAINT "Owner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "ownerId" INTEGER,
    "registrationNo" TEXT NOT NULL,
    "vin" TEXT,
    "engineNo" TEXT,
    "make" TEXT,
    "model" TEXT,
    "yearOfMfg" INTEGER,
    "category" "VehicleCategory" NOT NULL,
    "tareWeightKg" INTEGER,
    "engineCc" INTEGER,
    "evBatteryKwh" INTEGER,
    "telematicsImei" TEXT,
    "speedGovernorSerial" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "bookingRef" TEXT,
    "bookingFeePaid" BOOLEAN NOT NULL DEFAULT false,
    "bookingFeeReceiptNo" TEXT,
    "bookedForDate" TIMESTAMP(3),
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionItem" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" "ItemGroup" NOT NULL,
    "weightPct" INTEGER NOT NULL,
    "requiredForCategories" JSONB,

    CONSTRAINT "InspectionItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionSession" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "bookingId" INTEGER,
    "inspectorId" INTEGER,
    "inspectedAt" TIMESTAMP(3),
    "inspectionType" "InspectionType" NOT NULL,
    "odometerKm" INTEGER,
    "notes" TEXT,
    "status" "InspectionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "passThreshold" INTEGER NOT NULL DEFAULT 70,
    "totalScore" INTEGER NOT NULL DEFAULT 0,
    "defectSeverity" "DefectSeverity" NOT NULL DEFAULT 'NONE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InspectionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InspectionResult" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "itemId" INTEGER NOT NULL,
    "measuredValueNum" DECIMAL(65,30),
    "measuredValueText" TEXT,
    "pass" BOOLEAN NOT NULL,
    "severity" "ResultSeverity" NOT NULL DEFAULT 'INFO',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InspectionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "certificateNo" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "stickerNo" TEXT,
    "reportPdfUrl" TEXT,
    "verificationHash" TEXT NOT NULL,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReinspectionLink" (
    "id" SERIAL NOT NULL,
    "originalSessionId" INTEGER NOT NULL,
    "newSessionId" INTEGER NOT NULL,
    "freeWithin14Days" BOOLEAN NOT NULL DEFAULT false,
    "reason" TEXT,

    CONSTRAINT "ReinspectionLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaRef" (
    "id" SERIAL NOT NULL,
    "sessionId" INTEGER NOT NULL,
    "type" "MediaType" NOT NULL,
    "storageUrl" TEXT NOT NULL,
    "sha256" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cctvCameraId" TEXT,
    "cctvStartTs" TIMESTAMP(3),
    "cctvEndTs" TIMESTAMP(3),

    CONSTRAINT "MediaRef_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "tenantId" INTEGER NOT NULL,
    "actorUserId" INTEGER,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "beforeJson" JSONB,
    "afterJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "contactPerson" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "status" "InsurerStatus" NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Insurer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InsurerUser" (
    "id" SERIAL NOT NULL,
    "insurerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "InsurerUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" SERIAL NOT NULL,
    "insurerId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "scopes" JSONB,
    "lastUsedAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsageLog" (
    "id" SERIAL NOT NULL,
    "insurerId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "vehicleId" INTEGER,
    "statusCode" INTEGER NOT NULL,
    "responseMs" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsageLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "insurerId" INTEGER,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" SERIAL NOT NULL,
    "agentId" INTEGER NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "sessionId" INTEGER,
    "referredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedToPolicy" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Inspector_userId_key" ON "Inspector"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Inspector_licenceNo_key" ON "Inspector"("licenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_registrationNo_key" ON "Vehicle"("registrationNo");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_idx" ON "Vehicle"("tenantId");

-- CreateIndex
CREATE INDEX "Vehicle_registrationNo_idx" ON "Vehicle"("registrationNo");

-- CreateIndex
CREATE INDEX "Vehicle_vin_idx" ON "Vehicle"("vin");

-- CreateIndex
CREATE INDEX "Booking_tenantId_idx" ON "Booking"("tenantId");

-- CreateIndex
CREATE INDEX "Booking_vehicleId_idx" ON "Booking"("vehicleId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionItem_code_key" ON "InspectionItem"("code");

-- CreateIndex
CREATE INDEX "InspectionItem_group_idx" ON "InspectionItem"("group");

-- CreateIndex
CREATE INDEX "InspectionSession_tenantId_idx" ON "InspectionSession"("tenantId");

-- CreateIndex
CREATE INDEX "InspectionSession_vehicleId_idx" ON "InspectionSession"("vehicleId");

-- CreateIndex
CREATE INDEX "InspectionSession_inspectionType_idx" ON "InspectionSession"("inspectionType");

-- CreateIndex
CREATE INDEX "InspectionResult_sessionId_idx" ON "InspectionResult"("sessionId");

-- CreateIndex
CREATE INDEX "InspectionResult_itemId_idx" ON "InspectionResult"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "InspectionResult_sessionId_itemId_key" ON "InspectionResult"("sessionId", "itemId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_sessionId_key" ON "Certificate"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_certificateNo_key" ON "Certificate"("certificateNo");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_stickerNo_key" ON "Certificate"("stickerNo");

-- CreateIndex
CREATE UNIQUE INDEX "Certificate_verificationHash_key" ON "Certificate"("verificationHash");

-- CreateIndex
CREATE INDEX "Certificate_certificateNo_idx" ON "Certificate"("certificateNo");

-- CreateIndex
CREATE UNIQUE INDEX "ReinspectionLink_newSessionId_key" ON "ReinspectionLink"("newSessionId");

-- CreateIndex
CREATE INDEX "ReinspectionLink_originalSessionId_idx" ON "ReinspectionLink"("originalSessionId");

-- CreateIndex
CREATE INDEX "MediaRef_sessionId_idx" ON "MediaRef"("sessionId");

-- CreateIndex
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "Insurer_name_key" ON "Insurer"("name");

-- CreateIndex
CREATE UNIQUE INDEX "InsurerUser_userId_key" ON "InsurerUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_insurerId_idx" ON "ApiKey"("insurerId");

-- CreateIndex
CREATE INDEX "ApiUsageLog_insurerId_idx" ON "ApiUsageLog"("insurerId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_key" ON "Agent"("userId");

-- CreateIndex
CREATE INDEX "Referral_agentId_idx" ON "Referral"("agentId");

-- CreateIndex
CREATE INDEX "Referral_vehicleId_idx" ON "Referral"("vehicleId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspector" ADD CONSTRAINT "Inspector_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "Owner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSession" ADD CONSTRAINT "InspectionSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSession" ADD CONSTRAINT "InspectionSession_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSession" ADD CONSTRAINT "InspectionSession_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionSession" ADD CONSTRAINT "InspectionSession_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "Inspector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionResult" ADD CONSTRAINT "InspectionResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InspectionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InspectionResult" ADD CONSTRAINT "InspectionResult_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "InspectionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certificate" ADD CONSTRAINT "Certificate_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InspectionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReinspectionLink" ADD CONSTRAINT "ReinspectionLink_originalSessionId_fkey" FOREIGN KEY ("originalSessionId") REFERENCES "InspectionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReinspectionLink" ADD CONSTRAINT "ReinspectionLink_newSessionId_fkey" FOREIGN KEY ("newSessionId") REFERENCES "InspectionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaRef" ADD CONSTRAINT "MediaRef_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InspectionSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurerUser" ADD CONSTRAINT "InsurerUser_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsurerUser" ADD CONSTRAINT "InsurerUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsageLog" ADD CONSTRAINT "ApiUsageLog_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_insurerId_fkey" FOREIGN KEY ("insurerId") REFERENCES "Insurer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Agent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "InspectionSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;
