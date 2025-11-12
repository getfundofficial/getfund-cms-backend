const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/permissions');

// All user routes require admin role
router.get('/', auth, requireRole('admin'), UserController.getAll);
router.get('/:id', auth, requireRole('admin'), UserController.getById);
router.post('/', auth, requireRole('admin'), UserController.create);
router.put('/:id', auth, requireRole('admin'), UserController.update);
router.delete('/:id', auth, requireRole('admin'), UserController.deactivate);

module.exports = router;
