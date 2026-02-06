import { neon, Pool } from '@neondatabase/serverless';

// Use Neon serverless driver for queries (recommended for Vercel Edge/Serverless)
// Note: We don't set a timeout here because AbortSignal.timeout() creates a signal that
// expires after a fixed duration from creation, not from when it's used. Instead, we
// rely on the retry logic in retryQuery() to handle database wake-up delays.
const sql = neon(process.env.DATABASE_URL!);

// Use Neon Pool for traditional connection pooling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 180000, // Increased to 180 seconds for database wake-up
  idleTimeoutMillis: 10000,
  max: 5,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Helper function with retry logic for Neon database wake-up
async function retryQuery(text: string, params?: any[], maxRetries = 3) {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[DB] Query attempt ${attempt}/${maxRetries}`);
      const result = await sql(text, params || []);

      if (attempt > 1) {
        console.log(`[DB] Query succeeded after ${attempt} attempts`);
      }

      return { rows: result, rowCount: result.length };
    } catch (error: any) {
      lastError = error;
      const isTimeoutError = error.message?.includes('timeout') ||
                            error.message?.includes('aborted') ||
                            error.code === 'ETIMEDOUT';

      if (isTimeoutError && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff: 1s, 2s, 4s, 8s, 10s
        console.log(`[DB] Timeout on attempt ${attempt}, retrying in ${delay}ms... (Database may be waking up)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

// Helper function for queries - use serverless driver for better performance
export async function query(text: string, params?: any[]) {
  try {
    return await retryQuery(text, params);
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
