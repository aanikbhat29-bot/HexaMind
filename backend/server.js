const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET || 'hexamind-super-secret-jwt-key-2024';

// In-memory database
const users = new Map();
const classrooms = new Map();
const communityPosts = new Map();
const notifications = new Map();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Auth middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, error: 'Authorization token required' });
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
};

// Helper function to create JWT token
const createToken = (userId, email, role, name) => {
  return jwt.sign(
    { userId, email, role, name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Helper function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Helper function to compare passwords
const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

// ============ AUTH ENDPOINTS ============

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, role = 'student', name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }

    const passwordHash = await hashPassword(password);
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    users.set(email, {
      userId,
      email,
      passwordHash,
      role: role || 'student',
      name: name || email.split('@')[0],
      createdAt: new Date().toISOString(),
      lastLogin: null,
      sessions: []
    });

    const token = createToken(userId, email, role, name || email.split('@')[0]);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: {
        userId,
        email,
        role: role || 'student',
        name: name || email.split('@')[0]
      }
    });

    console.log(`✓ New user registered: ${email} (${role})`);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const user = users.get(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Update last login
    user.lastLogin = new Date().toISOString();
    user.sessions.push({
      loginAt: user.lastLogin,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    const token = createToken(user.userId, user.email, user.role, user.name);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.name
      }
    });

    console.log(`✓ User logged in: ${email}`);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

// GET /api/auth/profile
app.get('/api/auth/profile', verifyToken, (req, res) => {
  try {
    const user = users.get(req.user.email);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      profile: {
        userId: user.userId,
        email: user.email,
        role: user.role,
        name: user.name,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch profile: ' + error.message
    });
  }
});

// ============ CLASSROOM ENDPOINTS ============

// GET /api/classrooms
app.get('/api/classrooms', verifyToken, (req, res) => {
  try {
    const userClassrooms = Array.from(classrooms.values()).filter(c => 
      c.teacherId === req.user.userId || c.studentIds?.includes(req.user.userId)
    );
    
    res.json({
      success: true,
      classrooms: userClassrooms
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ COMMUNITY ENDPOINTS ============

// GET /api/community/posts
app.get('/api/community/posts', verifyToken, (req, res) => {
  try {
    const posts = Array.from(communityPosts.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      posts
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ NOTIFICATION ENDPOINTS ============

// GET /api/notifications
app.get('/api/notifications', verifyToken, (req, res) => {
  try {
    const userNotifications = Array.from(notifications.values()).filter(n =>
      n.recipientId === req.user.userId
    );
    
    res.json({
      success: true,
      notifications: userNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============ HEALTH CHECK ============

// GET /health
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'HexaMind Backend is running',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// GET /
app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'HexaMind AI Education Platform',
    version: '1.0.0',
    message: 'Backend API Server',
    endpoints: {
      auth: '/api/auth',
      classrooms: '/api/classrooms',
      community: '/api/community/posts',
      notifications: '/api/notifications',
      health: '/health'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n');
  console.log('╔════════════════════════════════════════════╗');
  console.log('║   HexaMind Backend Server Started           ║');
  console.log('╚════════════════════════════════════════════╝');
  console.log(`\n📡 Server running on http://0.0.0.0:${PORT}`);
  console.log(`🌐 Access from Android: http://192.168.1.37:${PORT}`);
  console.log(`\n📚 Available Endpoints:`);
  console.log(`   POST   /api/auth/register`);
  console.log(`   POST   /api/auth/login`);
  console.log(`   GET    /api/auth/profile`);
  console.log(`   GET    /api/classrooms`);
  console.log(`   GET    /api/community/posts`);
  console.log(`   GET    /api/notifications`);
  console.log(`   GET    /health`);
  console.log(`\n🔐 Default Demo Credentials:`);
  console.log(`   Email: demo@hexamind.ai`);
  console.log(`   Password: demo123`);
  console.log(`\n💾 Database: In-Memory (Data reset on restart)`);
  console.log(`   Users: ${users.size} registered`);
  console.log(`\n`);

  // Pre-populate demo user
  hashPassword('demo123').then(hash => {
    if (!users.has('demo@hexamind.ai')) {
      users.set('demo@hexamind.ai', {
        userId: 'demo_user_001',
        email: 'demo@hexamind.ai',
        passwordHash: hash,
        role: 'student',
        name: 'Demo User',
        createdAt: new Date().toISOString(),
        lastLogin: null,
        sessions: []
      });
      console.log('✓ Demo user pre-populated: demo@hexamind.ai / demo123\n');
    }
  });
});

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
