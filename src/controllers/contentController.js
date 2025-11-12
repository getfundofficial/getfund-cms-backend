const ContentService = require('../services/contentService');
const Content = require('../models/Content');
const Revision = require('../models/Revision');

class ContentController {
  // GET /api/content (admin/authenticated)
  static async getAll(req, res, next) {
    try {
      const { type, status, limit, offset } = req.query;

      const content = await ContentService.getAll(
        { type, status, limit, offset },
        req.user.id,
        req.user.role
      );

      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/content/published (public)
  static async getPublished(req, res, next) {
    try {
      const { type } = req.query;
      const content = await Content.getPublished(type);
      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/content/published/:slug (public)
  static async getBySlug(req, res, next) {
    try {
      const content = await Content.findBySlug(req.params.slug);
      if (!content) {
        return res.status(404).json({ error: 'Content not found' });
      }
      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/content/:id (admin/authenticated)
  static async getById(req, res, next) {
    try {
      const content = await ContentService.getById(
        req.params.id,
        req.user.id,
        req.user.role
      );
      res.json(content);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/content (admin/authenticated)
  static async create(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const content = await ContentService.create(
        req.body,
        req.user.id,
        ipAddress,
        userAgent
      );

      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/content/:id (admin/authenticated)
  static async update(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const content = await ContentService.update(
        req.params.id,
        req.body,
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

  // DELETE /api/content/:id (admin/authenticated)
  static async delete(req, res, next) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      const result = await ContentService.delete(
        req.params.id,
        req.user.id,
        req.user.role,
        ipAddress,
        userAgent
      );

      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/content/:id/revisions
  static async getRevisions(req, res, next) {
    try {
      const revisions = await Revision.getForContent(req.params.id);
      res.json(revisions);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/content/stats
  static async getStats(req, res, next) {
    try {
      const stats = await ContentService.getDashboardStats(
        req.user.id,
        req.user.role
      );
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ContentController;
