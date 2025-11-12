const express = require('express');
const router = express.Router();
const ContentController = require('../controllers/contentController');
const WorkflowController = require('../controllers/workflowController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// Public routes (no auth required)
router.get('/published', ContentController.getPublished);
router.get('/published/:slug', ContentController.getBySlug);

// Protected routes (auth required)
router.get('/stats', auth, ContentController.getStats);
router.get('/', auth, ContentController.getAll);
router.get('/:id', auth, ContentController.getById);
router.post('/', auth, ContentController.create);
router.put('/:id', auth, ContentController.update);
router.delete('/:id', auth, requireRole('approver', 'admin'), ContentController.delete);

// Revision routes
router.get('/:id/revisions', auth, ContentController.getRevisions);

// Workflow routes
router.post('/:id/submit', auth, WorkflowController.submit);
router.post('/:id/approve', auth, requireRole('reviewer', 'approver', 'admin'), WorkflowController.approve);
router.post('/:id/request-changes', auth, requireRole('reviewer', 'approver', 'admin'), WorkflowController.requestChanges);
router.post('/:id/publish', auth, requireRole('approver', 'admin'), WorkflowController.publish);
router.post('/:id/unpublish', auth, requireRole('approver', 'admin'), WorkflowController.unpublish);

module.exports = router;
