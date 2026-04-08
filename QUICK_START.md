# 🚀 QUICK START GUIDE - Soloskillset Backend

## ⚡ Get Running in 5 Minutes!

### Step 1: Install Node.js
Download from: https://nodejs.org (LTS version recommended)

### Step 2: Install MongoDB

**Option A: MongoDB Atlas (Cloud - Easiest)** ✅ RECOMMENDED
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create FREE account
3. Create a FREE cluster (M0)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Paste it in `.env` file as `MONGODB_URI`

**Option B: Local MongoDB**
1. Download from https://www.mongodb.com/try/download/community
2. Install and start MongoDB
3. Keep default `.env` setting: `MONGODB_URI=mongodb://localhost:27017/soloskillset`

### Step 3: Install Dependencies
Open terminal in the backend folder and run:
```bash
npm install
```

### Step 4: Start the Server
```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Soloskillset Backend Server running on port 3000
```

### Step 5: Update Frontend
Open `index.html` and add this line BEFORE the closing `</body>` tag:

```html
<script src="api-integration.js"></script>
```

Or manually update the API_URL in your existing code:
```javascript
const API_URL = 'http://localhost:3000/api';
```

### Step 6: Test It!
1. Open `index.html` in browser
2. Register a new account
3. Create a post
4. Open in another browser/incognito
5. Login with different account
6. You'll see the first user's post! 🎉

## 🌐 Deploy to Production (Free Options)

### Option 1: Render.com (Easiest)
1. Push code to GitHub
2. Go to https://render.com
3. New Web Service → Connect GitHub repo
4. Environment: Node
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables (MONGODB_URI, JWT_SECRET)
8. Click "Create Web Service"
9. Copy your URL (e.g., `https://yourapp.onrender.com`)
10. Update `API_URL` in `api-integration.js` to your Render URL

### Option 2: Railway.app
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add MongoDB plugin
4. Set environment variables
5. Deploy!

### Option 3: Heroku
```bash
heroku create soloskillset-backend
heroku addons:create mongolab
git push heroku main
```

## 🔧 Troubleshooting

**"Cannot connect to MongoDB"**
- Check MongoDB is running (if local)
- Verify connection string in `.env`
- Check network/firewall

**"Port 3000 already in use"**
- Change PORT in `.env` to 3001 or 5000
- Or kill existing process: `lsof -ti:3000 | xargs kill` (Mac/Linux)

**"Posts not showing"**
- Check API_URL is correct
- Open browser console (F12) - check for errors
- Verify backend is running: http://localhost:3000/api/health

**"CORS error"**
- Add your frontend URL to `.env` ALLOWED_ORIGINS
- Example: `ALLOWED_ORIGINS=http://localhost:5500,http://127.0.0.1:5500`

## 📱 Frontend Integration

Add to your `index.html` right after `<script>` tag:

```javascript
const API_URL = 'http://localhost:3000/api'; // or your deployed URL
let authToken = localStorage.getItem('authToken') || null;

async function apiCall(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
      ...options.headers
    }
  });
  return await response.json();
}
```

## ✅ Features Working with Backend

- ✅ Register/Login (JWT authentication)
- ✅ Posts visible worldwide to ALL users
- ✅ Internships shareable globally
- ✅ Real-time sync across devices
- ✅ User profiles accessible
- ✅ Certificate requests
- ✅ Like, Comment, Share on all posts
- ✅ Offline fallback to localStorage

## 🎯 Next Steps

1. ✅ Deploy backend to Render/Railway
2. ✅ Update `API_URL` to deployed URL
3. ✅ Test from multiple devices
4. ✅ Share your app worldwide!

## 🆘 Need Help?

Check the full `README.md` for detailed documentation.

Happy coding! 🎉
