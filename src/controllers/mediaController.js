const Media = require('../models/Media');
const AuditLog = require('../models/AuditLog');
const fs = require('fs').promises;
const path = require('path');

class MediaController {
  // GET /api/media
  static async getAll(req, res, next) {
    try {
      const { limit, offset } = req.query;
      const media = await Media.getAll({ limit, offset });
      res.json(media);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/media/upload
  static async upload(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const file = req.file;
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');

      // Build URL
      const url = `${req.protocol}://${req.get('host')}/uploads/${year}/${month}/${file.filename}`;

      // Create media record
      const media = await Media.create({
        filename: file.filename,
        original_name: file.originalname,
        mime_type: file.mimetype,
        size_bytes: file.size,
        file_path: file.path,
        url: url,
        alt_text: req.body.alt_text || '',
        uploaded_by: req.user.id
      });

      // Log action
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      await AuditLog.create({
        user_id: req.user.id,
        action: 'uploaded_media',
        entity_type: 'media',
        entity_id: media.id,
        changes: { filename: file.originalname },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      res.status(201).json(media);
    } catch (error) {
      // Clean up file if database insert fails
      if (req.file) {
        await fs.unlink(req.file.path).catch(console.error);
      }
      next(error);
    }
  }

  // PUT /api/media/:id
  static async updateAltText(req, res, next) {
    try {
      const { alt_text } = req.body;

      const media = await Media.updateAltText(req.params.id, alt_text);

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      res.json(media);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/media/:id
  static async delete(req, res, next) {
    try {
      const media = await Media.findById(req.params.id);

      if (!media) {
        return res.status(404).json({ error: 'Media not found' });
      }

      // Delete file from filesystem
      try {
        await fs.unlink(media.file_path);
      } catch (error) {
        console.error('Failed to delete file:', error);
      }

      // Delete from database
      await Media.delete(req.params.id);

      // Log action
      const ipAddress = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent');

      await AuditLog.create({
        user_id: req.user.id,
        action: 'deleted_media',
        entity_type: 'media',
        entity_id: req.params.id,
        changes: { filename: media.filename },
        ip_address: ipAddress,
        user_agent: userAgent
      });

      res.json({ message: 'Media deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MediaController;
