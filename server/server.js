const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'pixora_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit for videos/music
});

// JSON File Database Storage
const DB_FILE = path.join(__dirname, 'data.json');

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.error('Error reading DB file, initializing new one');
    }
  }

  // Clean empty database for production (only real users who sign up)
  const initialData = {
    users: [],
    posts: [],
    messages: []
  };

  fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2));
  return initialData;
}

let db = loadDB();

function saveDB() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ================= AUTH ROUTES =================
app.post('/api/auth/register', async (req, res) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const existing = db.users.find(u => u.email === email || u.username === username);
  if (existing) {
    return res.status(400).json({ error: 'Username or email already in use' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = {
    id: 'u_' + Date.now(),
    name,
    username: username.toLowerCase().trim(),
    email: email.toLowerCase().trim(),
    passwordHash,
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
    bio: 'Hey there! I am using Pixora.',
    followers: [],
    following: []
  };

  db.users.push(newUser);
  saveDB();

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = newUser;
  res.json({ token, user: safeUser });
});

app.post('/api/auth/login', async (req, res) => {
  const { credential, password } = req.body;
  if (!credential || !password) {
    return res.status(400).json({ error: 'Email/Username and password required' });
  }

  const user = db.users.find(u => u.email === credential.toLowerCase() || u.username === credential.toLowerCase());
  if (!user) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  const { passwordHash: _, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { passwordHash: _, ...safeUser } = user;
  res.json(safeUser);
});

// ================= POSTS ROUTES =================
app.get('/api/posts', (req, res) => {
  const enrichedPosts = db.posts.map(post => {
    const author = db.users.find(u => u.id === post.userId) || {
      name: 'Pixora User',
      username: 'user',
      avatar: 'https://api.dicebear.com/7.x/adventurer/svg?seed=user'
    };
    const enrichedComments = (post.comments || []).map(c => {
      const cUser = db.users.find(u => u.id === c.userId);
      return {
        ...c,
        userName: cUser ? cUser.name : 'User',
        userAvatar: cUser ? cUser.avatar : ''
      };
    });
    return {
      ...post,
      author: {
        id: author.id,
        name: author.name,
        username: author.username,
        avatar: author.avatar
      },
      comments: enrichedComments
    };
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(enrichedPosts);
});

app.post('/api/posts', authenticateToken, upload.single('media'), (req, res) => {
  const { caption, type, songTitle, songArtist } = req.body;
  let mediaUrl = req.body.mediaUrl;

  if (req.file) {
    mediaUrl = `/uploads/${req.file.filename}`;
  }

  if (!mediaUrl && !caption) {
    return res.status(400).json({ error: 'Post must have media or caption' });
  }

  const newPost = {
    id: 'p_' + Date.now(),
    userId: req.user.id,
    type: type || 'photo', // photo, video, song
    mediaUrl: mediaUrl || null,
    caption: caption || '',
    songTitle: songTitle || null,
    songArtist: songArtist || null,
    likes: [],
    comments: [],
    createdAt: new Date().toISOString()
  };

  db.posts.unshift(newPost);
  saveDB();

  res.status(201).json(newPost);
});

app.post('/api/posts/:id/like', authenticateToken, (req, res) => {
  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const userId = req.user.id;
  const index = post.likes.indexOf(userId);

  if (index === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(index, 1);
  }

  saveDB();
  res.json({ likes: post.likes, liked: index === -1 });
});

app.post('/api/posts/:id/comment', authenticateToken, (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ error: 'Comment text required' });
  }

  const post = db.posts.find(p => p.id === req.params.id);
  if (!post) return res.status(404).json({ error: 'Post not found' });

  const newComment = {
    id: 'c_' + Date.now(),
    userId: req.user.id,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  if (!post.comments) post.comments = [];
  post.comments.push(newComment);
  saveDB();

  const user = db.users.find(u => u.id === req.user.id);
  res.json({
    ...newComment,
    userName: user ? user.name : 'User',
    userAvatar: user ? user.avatar : ''
  });
});

// ================= USERS & PROFILES =================
app.get('/api/users/:username', (req, res) => {
  const user = db.users.find(u => u.username.toLowerCase() === req.params.username.toLowerCase());
  if (!user) return res.status(404).json({ error: 'User not found' });

  const userPosts = db.posts.filter(p => p.userId === user.id);
  const { passwordHash: _, ...safeUser } = user;

  res.json({
    ...safeUser,
    posts: userPosts
  });
});

app.post('/api/users/:id/follow', authenticateToken, (req, res) => {
  const targetUser = db.users.find(u => u.id === req.params.id);
  const currentUser = db.users.find(u => u.id === req.user.id);

  if (!targetUser || !currentUser) return res.status(404).json({ error: 'User not found' });
  if (targetUser.id === currentUser.id) return res.status(400).json({ error: 'Cannot follow yourself' });

  const isFollowing = currentUser.following.includes(targetUser.id);
  if (isFollowing) {
    currentUser.following = currentUser.following.filter(id => id !== targetUser.id);
    targetUser.followers = targetUser.followers.filter(id => id !== currentUser.id);
  } else {
    currentUser.following.push(targetUser.id);
    targetUser.followers.push(currentUser.id);
  }

  saveDB();
  res.json({ following: !isFollowing, followersCount: targetUser.followers.length });
});

// ================= MESSAGES (DMs) =================
app.get('/api/messages/:otherUserId', authenticateToken, (req, res) => {
  const currentId = req.user.id;
  const otherId = req.params.otherUserId;

  const thread = db.messages.filter(m => 
    (m.senderId === currentId && m.receiverId === otherId) ||
    (m.senderId === otherId && m.receiverId === currentId)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  res.json(thread);
});

app.post('/api/messages', authenticateToken, (req, res) => {
  const { receiverId, text } = req.body;
  if (!receiverId || !text || text.trim() === '') {
    return res.status(400).json({ error: 'Receiver and text required' });
  }

  const newMessage = {
    id: 'm_' + Date.now(),
    senderId: req.user.id,
    receiverId,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  db.messages.push(newMessage);
  saveDB();
  res.status(201).json(newMessage);
});

app.get('/api/users', (req, res) => {
  const safeUsers = db.users.map(({ passwordHash, ...u }) => u);
  res.json(safeUsers);
});

// Serve frontend build in production
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(clientDist, 'index.html'));
    }
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Pixora API Server running on http://localhost:${PORT}`);
});
