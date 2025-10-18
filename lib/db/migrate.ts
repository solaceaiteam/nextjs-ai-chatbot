import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'node:path';

config({
  path: '.env.local',
});

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

async function runMigrations() {
  await migrate(db, { migrationsFolder: path.join(__dirname, 'migrations') });
  console.log('Migrations complete.');
  process.exit(0);
}

runMigrations();
