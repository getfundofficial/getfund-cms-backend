const express = require('express');
const router = express.Router();
const MediaController = require('../controllers/mediaController');
const auth = require('../middleware/auth');
const upload = require('../config/upload');

// All media routes require authentication
router.get('/', auth, MediaController.getAll);
router.post('/upload', auth, upload.single('file'), MediaController.upload);
router.put('/:id', auth, MediaController.updateAltText);
router.delete('/:id', auth, MediaController.delete);

module.exports = router;
