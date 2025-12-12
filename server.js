const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const { networkInterfaces } = require('os');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middleware
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: ['http://localhost:3000', process.env.CORS_ORIGIN || '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/batch', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'batch.html'));
});

app.get('/read-batch', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'read_batch.html'));
});

app.get('/read-index', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'read_index.html'));
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'TERAHOP Online Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    mode: process.env.NODE_ENV || 'development',
    port: PORT,
    host: HOST
  });
});

// Language Support API
app.get('/api/languages', async (req, res) => {
  try {
    const languages = [
      { code: 'th', name: 'ภาษาไทย', nativeName: 'ภาษาไทย', flag: '🇹🇭' },
      { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
      { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
      { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' }
    ];
    res.json({ languages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to load languages' });
  }
});

// Translation API
app.get('/translations/:lang', async (req, res) => {
  try {
    const { lang } = req.params;
    const filePath = path.join(__dirname, 'translations', `${lang}.json`);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({ error: 'Translation file not found' });
    }
    
    // Read translation file
    const translations = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(translations));
  } catch (error) {
    console.error('Error loading translations:', error);
    res.status(500).json({ error: 'Failed to load translations' });
  }
});

// Set language preference API
app.post('/api/language', express.json(), async (req, res) => {
  try {
    const { language } = req.body;
    const supportedLanguages = ['th', 'en', 'zh-CN', 'zh-TW'];
    
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }
    
    // In a real application, you would save this to database or user session
    res.json({ success: true, language });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set language' });
  }
});

// API for server info
app.get('/api/server-info', (req, res) => {
  const nets = networkInterfaces();
  const results = Object.create(null);
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  res.json({
    server_name: 'TERAHOP Online Server',
    ip_address: req.ip,
    user_agent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
    network_interfaces: results,
    port: PORT
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log('🌐 TERAHOP Online Server Started!');
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 Network: http://${HOST}:${PORT}`);
  console.log(`⏰ Started at: ${new Date().toLocaleString()}`);
  
  // Get local IP addresses
  const nets = networkInterfaces();
  const results = Object.create(null);
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  
  console.log('\n🌍 Available on your network at:');
  for (const [name, addresses] of Object.entries(results)) {
    for (const address of addresses) {
      console.log(`   http://${address}:${PORT}`);
    }
  }
  
  console.log('\n📱 Anyone on your network can access using the IP addresses above');
  console.log('🚀 For internet access, run: npm run online');
  console.log('🔧 Or use any tunneling service like ngrok:');
  console.log(`   ngrok http ${PORT}`);
  
  console.log('\n📊 Server Information:');
  console.log(`   - Main Application: http://localhost:${PORT}/`);
  console.log(`   - Batch Management: http://localhost:${PORT}/batch`);
  console.log(`   - Read Batch: http://localhost:${PORT}/read-batch`);
  console.log(`   - Read Index: http://localhost:${PORT}/read-index`);
  console.log(`   - API Health: http://localhost:${PORT}/api/health`);
  console.log(`   - Server Info: http://localhost:${PORT}/api/server-info`);
});

module.exports = app;