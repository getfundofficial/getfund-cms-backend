// Role-based access control middleware

const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
};

// Check if user has permission to create/edit a specific content type
const requireContentPermission = (contentType) => {
  return (req, res, next) => {
    const { user } = req;

    // Admins have access to everything
    if (user.role === 'admin') {
      return next();
    }

    // Check if user has the specific content type permission
    if (!user.permissions || !Array.isArray(user.permissions)) {
      return res.status(403).json({
        error: 'No permissions configured for your account'
      });
    }

    if (!user.permissions.includes(contentType)) {
      return res.status(403).json({
        error: `You don't have permission to access ${contentType} content`
      });
    }

    next();
  };
};

// Check if user can edit specific content
const canEditContent = async (req, res, next) => {
  const { user } = req;
  const { id } = req.params;

  // Admins can edit anything
  if (user.role === 'admin') {
    return next();
  }

  // Get the content to check ownership and status
  try {
    const { pool } = require('../config/database');
    const result = await pool.query(
      'SELECT author_id, status, type FROM content WHERE id = $1 AND deleted_at IS NULL',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Content not found' });
    }

    const content = result.rows[0];

    // Check content type permission
    if (!user.permissions || !user.permissions.includes(content.type)) {
      return res.status(403).json({
        error: `You don't have permission to edit ${content.type} content`
      });
    }

    // Check ownership
    if (content.author_id !== user.id) {
      return res.status(403).json({
        error: 'You can only edit your own content'
      });
    }

    // Check status
    if (!['draft', 'changes_requested'].includes(content.status)) {
      return res.status(403).json({
        error: 'You can only edit content in draft or changes_requested status'
      });
    }

    next();
  } catch (error) {
    console.error('Permission check error:', error);
    return res.status(500).json({ error: 'Failed to verify permissions' });
  }
};

// Permission helpers
const canApprove = (role) => ['reviewer', 'approver', 'admin'].includes(role);
const canPublish = (role) => ['approver', 'admin'].includes(role);
const canManageUsers = (role) => role === 'admin';
const canDelete = (role) => ['approver', 'admin'].includes(role);

module.exports = {
  requireRole,
  requireContentPermission,
  canEditContent,
  canApprove,
  canPublish,
  canManageUsers,
  canDelete
};
