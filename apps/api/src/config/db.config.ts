import { Pool, QueryResult } from 'pg';
import 'dotenv/config';

class Db {
  private static instance: Db;
  private readonly pool: Pool;
  constructor() {
    this.pool = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT || '5432', 10),
    });
    this.pool.on('connect', () => {
      console.log('Database connected');
    });
    this.pool.on('error', err => {
      console.error('Database error:', err);
      process.exit(1);
    });
  }

  public static getInstance(): Db {
    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }

  public async query<T>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
    return this.pool.query(text, params);
  }
}

export const db = Db.getInstance();
