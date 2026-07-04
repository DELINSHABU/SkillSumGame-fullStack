import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://skillsum:skillsum_dev@localhost:5432/skillsum';

export const pool = new pg.Pool({ connectionString });

export const db = drizzle(pool, { schema });

export type Db = typeof db;
