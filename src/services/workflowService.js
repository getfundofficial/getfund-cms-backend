const Content = require('../models/Content');
const AuditLog = require('../models/AuditLog');

class WorkflowService {
  // Submit content for review
  static async submitForReview(contentId, userId, userRole, ipAddress, userAgent) {
    const content = await Content.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    // Only the creator or admin can submit
    if (content.created_by !== userId && userRole !== 'admin') {
      throw new Error('Only the content creator can submit for review');
    }

    // Can only submit drafts or changes_requested
    if (!['draft', 'changes_requested'].includes(content.status)) {
      throw new Error('Content must be in draft or changes_requested status');
    }

    const updated = await Content.updateStatus(contentId, 'in_review', userId);

    await AuditLog.create({
      user_id: userId,
      action: 'submitted_for_review',
      entity_type: 'content',
      entity_id: contentId,
      changes: { from: content.status, to: 'in_review' },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return updated;
  }

  // Approve content (Reviewer action)
  static async approve(contentId, userId, userRole, ipAddress, userAgent) {
    if (!['reviewer', 'approver', 'admin'].includes(userRole)) {
      throw new Error('Permission denied');
    }

    const content = await Content.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status !== 'in_review') {
      throw new Error('Content must be in review status');
    }

    const updated = await Content.updateStatus(contentId, 'approved', userId);

    await AuditLog.create({
      user_id: userId,
      action: 'approved',
      entity_type: 'content',
      entity_id: contentId,
      changes: { from: 'in_review', to: 'approved' },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return updated;
  }

  // Request changes (Reviewer action)
  static async requestChanges(contentId, userId, userRole, notes, ipAddress, userAgent) {
    if (!['reviewer', 'approver', 'admin'].includes(userRole)) {
      throw new Error('Permission denied');
    }

    const content = await Content.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status !== 'in_review') {
      throw new Error('Content must be in review status');
    }

    if (!notes || notes.trim().length === 0) {
      throw new Error('Review notes are required when requesting changes');
    }

    const updated = await Content.updateStatus(contentId, 'changes_requested', userId, notes);

    await AuditLog.create({
      user_id: userId,
      action: 'requested_changes',
      entity_type: 'content',
      entity_id: contentId,
      changes: { from: 'in_review', to: 'changes_requested', notes },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return updated;
  }

  // Publish content (Approver action)
  static async publish(contentId, userId, userRole, ipAddress, userAgent) {
    if (!['approver', 'admin'].includes(userRole)) {
      throw new Error('Only approvers can publish content');
    }

    const content = await Content.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status !== 'approved') {
      throw new Error('Content must be approved before publishing');
    }

    const updated = await Content.updateStatus(contentId, 'published', userId);

    await AuditLog.create({
      user_id: userId,
      action: 'published',
      entity_type: 'content',
      entity_id: contentId,
      changes: { from: 'approved', to: 'published' },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return updated;
  }

  // Unpublish content (Approver action)
  static async unpublish(contentId, userId, userRole, ipAddress, userAgent) {
    if (!['approver', 'admin'].includes(userRole)) {
      throw new Error('Only approvers can unpublish content');
    }

    const content = await Content.findById(contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    if (content.status !== 'published') {
      throw new Error('Content is not published');
    }

    const updated = await Content.updateStatus(contentId, 'draft', userId);

    await AuditLog.create({
      user_id: userId,
      action: 'unpublished',
      entity_type: 'content',
      entity_id: contentId,
      changes: { from: 'published', to: 'draft' },
      ip_address: ipAddress,
      user_agent: userAgent
    });

    return updated;
  }
}

module.exports = WorkflowService;
