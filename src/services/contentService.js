const Content = require('../models/Content');
const Revision = require('../models/Revision');
const AuditLog = require('../models/AuditLog');

class ContentService {
  // Create slug from title
  static createSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Get all content with role-based filtering
  static async getAll(filters, userId, userRole) {
    // Creators can only see their own drafts
    if (userRole === 'creator') {
      return await Content.getAll({ ...filters, created_by: userId });
    }

    return await Content.getAll(filters);
  }

  // Get content by ID
  static async getById(id, userId, userRole) {
    const content = await Content.findById(id);
    if (!content) {
      throw new Error('Content not found');
    }

    // Creators can only access their own content (unless it's published)
    if (userRole === 'creator' && content.created_by !== userId && content.status !== 'published') {
      throw new Error('Access denied');
    }

    return content;
  }

  // Create new content
  static async create(data, userId, ipAddress, userAgent) {
    // Generate slug if not provided
    if (!data.slug && data.title) {
      data.slug = this.createSlug(data.title);
    }

    data.created_by = userId;

    const content = await Content.create(data);

    // Create initial revision
    await Revision.create({
      content_id: content.id,
      version_number: 1,
      title: content.title,
      excerpt: content.excerpt,
      body: content.body,
      meta_data: content.meta_data,
      created_by: userId
    });

    // Log action
    await AuditLog.create({
      user_id: userId,
      action: 'created',
      entity_type: 'content',
      entity_id: content.id,
      changes: { content_type: content.type, title: content.title },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return content;
  }

  // Update content
  static async update(id, data, userId, userRole, ipAddress, userAgent) {
    const content = await this.getById(id, userId, userRole);

    // Creators can only edit drafts or changes_requested
    if (userRole === 'creator' && !['draft', 'changes_requested'].includes(content.status)) {
      throw new Error('Cannot edit content in this status');
    }

    const updated = await Content.update(id, data);

    // Create new revision
    const latestVersion = await Revision.getLatestVersionNumber(id);
    await Revision.create({
      content_id: id,
      version_number: latestVersion + 1,
      title: updated.title,
      excerpt: updated.excerpt,
      body: updated.body,
      meta_data: updated.meta_data,
      created_by: userId
    });

    // Log action
    await AuditLog.create({
      user_id: userId,
      action: 'updated',
      entity_type: 'content',
      entity_id: id,
      changes: data,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return updated;
  }

  // Delete content
  static async delete(id, userId, userRole, ipAddress, userAgent) {
    const content = await this.getById(id, userId, userRole);

    // Only approvers and admins can delete
    if (!['approver', 'admin'].includes(userRole)) {
      throw new Error('Permission denied');
    }

    await Content.softDelete(id);

    // Log action
    await AuditLog.create({
      user_id: userId,
      action: 'deleted',
      entity_type: 'content',
      entity_id: id,
      changes: { title: content.title },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return { message: 'Content deleted successfully' };
  }

  // Get dashboard stats
  static async getDashboardStats(userId, userRole) {
    const counts = await Content.getCountByStatus(userId, userRole);

    const stats = {
      draft: 0,
      in_review: 0,
      changes_requested: 0,
      approved: 0,
      published: 0
    };

    counts.forEach(item => {
      stats[item.status] = parseInt(item.count);
    });

    return stats;
  }
}

module.exports = ContentService;
