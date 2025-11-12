const WorkflowService = require('../services/workflowService');

class WorkflowController {
  // POST /api/content/:id/submit
  static async submit(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const content = await WorkflowService.submitForReview(
        req.params.id,
        req.user.id,
        req.user.role,
        ipAddress,
        userAgent
      );

      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/content/:id/approve
  static async approve(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const content = await WorkflowService.approve(
        req.params.id,
        req.user.id,
        req.user.role,
        ipAddress,
        userAgent
      );

      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/content/:id/request-changes
  static async requestChanges(req, res, next) {
    try {
      const { notes } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const content = await WorkflowService.requestChanges(
        req.params.id,
        req.user.id,
        req.user.role,
        notes,
        ipAddress,
        userAgent
      );

      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/content/:id/publish
  static async publish(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const content = await WorkflowService.publish(
        req.params.id,
        req.user.id,
        req.user.role,
        ipAddress,
        userAgent
      );

      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/content/:id/unpublish
  static async unpublish(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const content = await WorkflowService.unpublish(
        req.params.id,
        req.user.id,
        req.user.role,
        ipAddress,
        userAgent
      );

      res.json(content);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WorkflowController;
