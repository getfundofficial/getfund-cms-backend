const AuditService = require('../services/auditService');

class AuditController {
  // GET /api/audit
  static async getAll(req, res, next) {
    try {
      const { user_id, entity_type, entity_id, action, limit, offset } = req.query;

      const logs = await AuditService.getAll(
        { user_id, entity_type, entity_id, action, limit, offset },
        req.user.role,
        req.user.id
      );

      res.json(logs);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/audit/content/:id
  static async getForContent(req, res, next) {
    try {
      const logs = await AuditService.getForContent(req.params.id);
      res.json(logs);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuditController;
