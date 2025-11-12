const AuditLog = require('../models/AuditLog');

class AuditService {
  // Get all audit logs with filters
  static async getAll(filters, userRole, userId) {
    // Regular users can only see their own logs
    if (userRole === 'creator') {
      filters.user_id = userId;
    }

    return await AuditLog.getAll(filters);
  }

  // Get logs for specific content
  static async getForContent(contentId) {
    return await AuditLog.getForContent(contentId);
  }
}

module.exports = AuditService;
