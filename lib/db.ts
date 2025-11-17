import { neon, neonConfig, Pool } from '@neondatabase/serverless';

// Configure Neon for optimal performance
neonConfig.fetchConnectionCache = true;

// Use Neon serverless driver for queries (recommended for Vercel Edge/Serverless)
const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    // Increase timeout to 30 seconds to allow database to wake up from sleep
    // Neon free tier databases suspend after inactivity
    signal: AbortSignal.timeout(30000),
  },
});

// Use Neon Pool for traditional connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 30000, // Increased to 30 seconds for database wake-up
  idleTimeoutMillis: 10000,
  max: 5,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Helper function for queries - use serverless driver for better performance
export async function query(text: string, params?: any[]) {
  try {
    // Use Neon's serverless driver
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
