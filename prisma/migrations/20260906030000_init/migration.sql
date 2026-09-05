CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'SECURITY_ANALYST');
CREATE TYPE "FileStatus" AS ENUM ('UPLOADED', 'ENCRYPTED', 'VERIFIED', 'TAMPERED');
CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
  "id" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecureFile" (
  "id" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "storedName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "path" TEXT NOT NULL,
  "sha256" TEXT NOT NULL,
  "status" "FileStatus" NOT NULL DEFAULT 'UPLOADED',
  "encryptedPath" TEXT,
  "iv" TEXT,
  "authTag" TEXT,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SecureFile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FileVerification" (
  "id" TEXT NOT NULL,
  "fileId" TEXT NOT NULL,
  "valid" BOOLEAN NOT NULL,
  "hash" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FileVerification_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "BlockchainRecord" (
  "id" TEXT NOT NULL,
  "transactionId" TEXT NOT NULL,
  "network" TEXT NOT NULL DEFAULT 'SHAKTII-DEMO',
  "fileHash" TEXT NOT NULL,
  "blockNumber" INTEGER,
  "verified" BOOLEAN NOT NULL DEFAULT true,
  "fileId" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BlockchainRecord_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SecurityEvent" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "severity" "Severity" NOT NULL,
  "description" TEXT NOT NULL,
  "resource" TEXT,
  "ipAddress" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SecurityEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT,
  "status" TEXT NOT NULL,
  "metadata" JSONB,
  "userId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");
CREATE UNIQUE INDEX "SecureFile_storedName_key" ON "SecureFile"("storedName");
CREATE UNIQUE INDEX "BlockchainRecord_transactionId_key" ON "BlockchainRecord"("transactionId");

ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SecureFile" ADD CONSTRAINT "SecureFile_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FileVerification" ADD CONSTRAINT "FileVerification_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "SecureFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlockchainRecord" ADD CONSTRAINT "BlockchainRecord_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "SecureFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "BlockchainRecord" ADD CONSTRAINT "BlockchainRecord_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
