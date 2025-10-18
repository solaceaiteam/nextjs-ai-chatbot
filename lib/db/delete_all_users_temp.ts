// WARNING: This script deletes ALL user accounts and related data from the database.
// Use ONLY for temporary cleanup during deployment. DELETE THIS FILE after use!

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  user,
  chat,
  message,
  vote,
  document,
  suggestion,
  stream,
} from './schema';

// Use the same connection string logic as queries.ts
const connectionString =
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'No Postgres connection string found in POSTGRES_URL, POSTGRES_PRISMA_URL, or DATABASE_URL',
  );
}
const client = postgres(connectionString);
const db = drizzle(client);

async function deleteAllUsersAndRelatedData() {
  // Delete in order of dependencies (only data, not tables)
  await db.delete(vote);
  await db.delete(message);
  await db.delete(stream);
  await db.delete(chat);
  await db.delete(document);
  await db.delete(suggestion);
  await db.delete(user);
  console.log('All user accounts and related data deleted.');
}

deleteAllUsersAndRelatedData().then(() => process.exit(0));
