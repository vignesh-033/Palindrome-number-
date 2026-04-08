# Soloskillset Backend Server

Complete backend API for Soloskillset social learning platform with MongoDB database.

## 🚀 Features

- ✅ User Authentication (Register/Login with JWT)
- ✅ Posts Management (Create, Read, Update, Delete)
- ✅ Internships System
- ✅ Certificate Requests
- ✅ User Profiles
- ✅ Real-time Sync
- ✅ Worldwide Access

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (Local or MongoDB Atlas)
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
- Install MongoDB from https://www.mongodb.com/try/download/community
- Start MongoDB service:
  ```bash
  mongod
  ```

**Option B: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get your connection string
5. Update `.env` file with your connection string

### 3. Configure Environment Variables

Edit `.env` file:
```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

### 4. Start Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on: `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:email` - Get user by email
- `PUT /api/users/:email` - Update user profile

### Posts
- `GET /api/posts` - Get all posts (worldwide)
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post (likes, comments)
- `DELETE /api/posts/:id` - Delete post

### Internships
- `GET /api/internships` - Get all internships
- `POST /api/internships` - Create internship
- `PUT /api/internships/:id` - Update internship
- `DELETE /api/internships/:id` - Delete internship

### Certificates
- `GET /api/certificates` - Get all certificate requests
- `POST /api/certificates` - Create certificate request
- `PUT /api/certificates/:id` - Update certificate (approve/reject)

### Health Check
- `GET /api/health` - Check if API is running

## 🌐 Frontend Integration

Update your frontend `index.html` to use this backend URL:

```javascript
const API_URL = 'http://localhost:3000/api';
```

Or for production:
```javascript
const API_URL = 'https://your-domain.com/api';
```

## 🚀 Deployment Options

### Option 1: Deploy to Render.com (Free)

1. Push code to GitHub
2. Go to https://render.com
3. Create new "Web Service"
4. Connect your GitHub repo
5. Set environment variables
6. Deploy!

### Option 2: Deploy to Railway.app (Free)

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add MongoDB database
4. Set environment variables
5. Deploy!

### Option 3: Deploy to Heroku

```bash
heroku create soloskillset-api
heroku addons:create mongolab
git push heroku main
```

### Option 4: Deploy to VPS (DigitalOcean, AWS, etc.)

1. SSH into your server
2. Clone repository
3. Install Node.js and MongoDB
4. Run with PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name soloskillset-api
   pm2 startup
   pm2 save
   ```

## 🔒 Security Notes

- Change `JWT_SECRET` in production
- Use HTTPS in production
- Enable MongoDB authentication
- Set proper CORS origins
- Use environment variables for all secrets

## 📊 Database Schema

### Users Collection
- name, email, password (hashed)
- phone, college, role
- dp, wall, subtitle
- skills, certificates
- followers, following, blocked

### Posts Collection
- id, user, userEmail
- text, hashtags, media
- likes, comments
- timestamps

### Internships Collection
- id, title, company
- desc, link, stipend
- duration, mode, tags
- likes, saved, media

### Certificates Collection
- id, email, course
- start, end, status
- approval details

## 🐛 Troubleshooting

**MongoDB connection error:**
- Check if MongoDB is running
- Verify connection string in `.env`
- Check firewall settings

**Port already in use:**
- Change PORT in `.env` file
- Kill process using port 3000:
  ```bash
  lsof -ti:3000 | xargs kill
  ```

**CORS errors:**
- Add your frontend URL to ALLOWED_ORIGINS in `.env`
- Check CORS middleware settings

## 📝 License

MIT License - feel free to use for your projects!

## 👨‍💻 Support

For issues or questions, create an issue on GitHub or contact the team.
