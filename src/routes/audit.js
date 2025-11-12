const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/auditController');
const auth = require('../middleware/auth');

// All audit routes require authentication
router.get('/', auth, AuditController.getAll);
router.get('/content/:id', auth, AuditController.getForContent);

module.exports = router;
