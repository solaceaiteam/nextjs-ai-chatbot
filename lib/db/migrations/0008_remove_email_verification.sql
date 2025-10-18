-- Remove the 'verified' column from the User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "verified";

-- Drop the VerificationToken table if it exists
DROP TABLE IF EXISTS "VerificationToken"; 