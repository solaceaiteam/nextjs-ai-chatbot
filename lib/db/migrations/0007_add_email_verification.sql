-- Add verified field to user table
ALTER TABLE "User" ADD COLUMN "verified" boolean NOT NULL DEFAULT false;

-- Create verification_tokens table
CREATE TABLE "VerificationToken" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" uuid NOT NULL REFERENCES "User"("id"),
  "token" varchar(128) NOT NULL UNIQUE,
  "expiresAt" timestamp NOT NULL
); 