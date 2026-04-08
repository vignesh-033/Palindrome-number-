// Soloskillset Backend Server
// Node.js + Express + MongoDB

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'soloskillset-secret-key-2025';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/soloskillset';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ==================== SCHEMAS ====================

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  college: String,
  role: { type: String, default: 'user' },
  dp: String,
  wall: String,
  subtitle: String,
  education: String,
  skills: [String],
  certificates: [Object],
  followers: [String],
  following: [String],
  blocked: [String],
  likedPosts: [Number],
  savedPosts: [Number],
  commentedPosts: [Object],
  likedInternships: [Number],
  savedInternships: [Number],
  verified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

// Post Schema
const postSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: { type: String, required: true },
  userEmail: { type: String, required: true },
  text: String,
  hashtags: [String],
  media: [Object],
  likes: [String],
  comments: [Object],
  _ts: { type: Number, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Internship Schema
const internshipSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  company: { type: String, required: true },
  desc: String,
  link: String,
  stipend: String,
  duration: String,
  mode: String,
  tags: String,
  likes: [String],
  saved: [String],
  media: [Object],
  _ts: { type: Number, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

// Certificate Request Schema
const certRequestSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  phone: String,
  college: String,
  course: { type: String, required: true },
  start: String,
  end: String,
  status: { type: String, default: 'pending' },
  submittedAt: String,
  approvedAt: String,
  rejectedAt: String,
  rejectReason: String
});

// Models
const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Internship = mongoose.model('Internship', internshipSchema);
const CertRequest = mongoose.model('CertRequest', certRequestSchema);

// ==================== MIDDLEWARE ====================

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, college } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      college,
      role: 'user',
      education: college,
      skills: []
    });

    await user.save();

    // Generate token
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    res.json({
      success: true,
      token,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        college: user.college
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });

    // Remove password from response
    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      success: true,
      token,
      user: userObj
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ==================== USER ROUTES ====================

// Get all users (for profiles, search, etc.)
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, { password: 0 });
    const usersObj = {};
    users.forEach(u => {
      usersObj[u.email] = u;
    });
    res.json(usersObj);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email }, { password: 0 });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user profile
app.put('/api/users/:email', authenticateToken, async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // Don't allow password updates this way
    
    const user = await User.findOneAndUpdate(
      { email: req.params.email },
      { $set: updates },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ==================== POST ROUTES ====================

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ _ts: -1 });
    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Get single post
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id });
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Failed to fetch post' });
  }
});

// Create post
app.post('/api/posts', authenticateToken, async (req, res) => {
  try {
    const postData = req.body;
    postData._ts = Date.now();
    
    const post = new Post(postData);
    await post.save();

    res.json(post);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Update post (for likes, comments)
app.put('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Failed to update post' });
  }
});

// Delete post
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({ id: req.params.id });
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ success: true, message: 'Post deleted' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// ==================== INTERNSHIP ROUTES ====================

// Get all internships
app.get('/api/internships', async (req, res) => {
  try {
    const internships = await Internship.find().sort({ _ts: -1 });
    res.json(internships);
  } catch (error) {
    console.error('Get internships error:', error);
    res.status(500).json({ error: 'Failed to fetch internships' });
  }
});

// Create internship
app.post('/api/internships', authenticateToken, async (req, res) => {
  try {
    const internship = new Internship(req.body);
    await internship.save();
    res.json(internship);
  } catch (error) {
    console.error('Create internship error:', error);
    res.status(500).json({ error: 'Failed to create internship' });
  }
});

// Update internship
app.put('/api/internships/:id', authenticateToken, async (req, res) => {
  try {
    const internship = await Internship.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    res.json(internship);
  } catch (error) {
    console.error('Update internship error:', error);
    res.status(500).json({ error: 'Failed to update internship' });
  }
});

// Delete internship
app.delete('/api/internships/:id', authenticateToken, async (req, res) => {
  try {
    const internship = await Internship.findOneAndDelete({ id: req.params.id });
    
    if (!internship) {
      return res.status(404).json({ error: 'Internship not found' });
    }

    res.json({ success: true, message: 'Internship deleted' });
  } catch (error) {
    console.error('Delete internship error:', error);
    res.status(500).json({ error: 'Failed to delete internship' });
  }
});

// ==================== CERTIFICATE ROUTES ====================

// Get all certificate requests
app.get('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const certs = await CertRequest.find();
    res.json(certs);
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Failed to fetch certificates' });
  }
});

// Create certificate request
app.post('/api/certificates', authenticateToken, async (req, res) => {
  try {
    const cert = new CertRequest(req.body);
    await cert.save();
    res.json(cert);
  } catch (error) {
    console.error('Create certificate error:', error);
    res.status(500).json({ error: 'Failed to create certificate request' });
  }
});

// Update certificate (approve/reject)
app.put('/api/certificates/:id', authenticateToken, async (req, res) => {
  try {
    const cert = await CertRequest.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { new: true }
    );

    if (!cert) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    res.json(cert);
  } catch (error) {
    console.error('Update certificate error:', error);
    res.status(500).json({ error: 'Failed to update certificate' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Soloskillset API is running',
    timestamp: new Date().toISOString()
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`🚀 Soloskillset Backend Server running on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api`);
  console.log(`🗄️  MongoDB: ${MONGODB_URI}`);
});
