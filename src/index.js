const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.PUBLIC_WEBSITE_URL || 'http://localhost:5173',
    process.env.ADMIN_DASHBOARD_URL || 'http://localhost:5174'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Database connection
const { pool } = require('./config/database');

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GETFund CMS API is running' });
});

// Simple news API for our database structure
app.get('/api/news', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, slug, excerpt, body as content, featured_image_url as image_url,
             published_at as date, category, author, created_at
      FROM content
      WHERE type = 'news'
        AND status = 'published'
        AND deleted_at IS NULL
      ORDER BY published_at DESC, created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching news:', error);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Simple hero slides API for our database structure  
app.get('/api/hero-slides', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, title, subtitle, image_url, link_url, link_text, display_order
      FROM hero_slides 
      WHERE is_active = true
      ORDER BY display_order ASC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    res.status(500).json({ error: 'Failed to fetch hero slides' });
  }
});

// Import routes (will be created next)
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const userRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');
const auditRoutes = require('./routes/audit');

app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/audit', auditRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 CMS Backend running on http://localhost:${PORT}`);
  console.log(`📝 API documentation: http://localhost:${PORT}/api/health`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
});

module.exports = app;
