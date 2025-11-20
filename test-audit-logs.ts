import { query } from './lib/db';

async function testAuditLogs() {
  try {
    console.log('Testing audit logs table...\n');

    // Check if table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'audit_logs'
      );
    `);
    console.log('Audit logs table exists:', tableCheck.rows[0].exists);

    // Count total records
    const countResult = await query('SELECT COUNT(*) as total FROM audit_logs');
    console.log('Total audit log records:', countResult.rows[0].total);

    // Get recent logs
    const logsResult = await query(`
      SELECT
        al.*,
        u.full_name as user_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 10
    `);

    console.log('\nRecent audit logs:');
    console.log(JSON.stringify(logsResult.rows, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testAuditLogs();
