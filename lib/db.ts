import { neon, neonConfig, Pool } from '@neondatabase/serverless';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Use Neon serverless driver for queries (recommended for Vercel Edge/Serverless)
const sql = neon(process.env.DATABASE_URL!);

// Use Neon Pool for traditional connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Helper function for queries using Neon's serverless driver (recommended)
export async function query(text: string, params?: any[]) {
  try {
    // Use Neon's serverless driver for better performance on Vercel
    const result = await sql(text, params || []);
    return { rows: result, rowCount: result.length };
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Helper function for transactions (uses traditional pool)
export async function transaction(callback: (client: any) => Promise<void>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await callback(client);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

// Export both for flexibility
export { pool, sql };
