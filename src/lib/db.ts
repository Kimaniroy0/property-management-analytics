import { Pool } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const connectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL;

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 10_000,
});

export default pool;
