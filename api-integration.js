// Soloskillset Frontend API Integration
// Add this script BEFORE your main script in index.html

const API_URL = 'http://localhost:3000/api'; // Change to your deployed URL
let authToken = localStorage.getItem('authToken') || null;

// ==================== API HELPER FUNCTIONS ====================

async function apiCall(endpoint, options = {}) {
  try {
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` })
      }
    };
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
      headers: { ...defaultOptions.headers, ...options.headers }
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    // Fallback to localStorage if API fails
    return null;
  }
}

// ==================== OVERRIDE EXISTING FUNCTIONS ====================

// Override loginUser function
async function loginUser() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value.trim();
  
  try {
    // Try backend login first
    const response = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass })
    });
    
    if (response && response.success) {
      authToken = response.token;
      localStorage.setItem('authToken', authToken);
      currentUser = response.user;
      currentUser.education ||= currentUser.college || "Add your school / college / company";
      currentUser.skills ||= ["HTML","CSS"];
      currentUser.certificates ||= [];
      currentUser.pass = pass; // Store for backward compatibility
      
      // Save to localStorage as backup
      users[email] = currentUser;
      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', email);
      
      // Track session
      const _sess = JSON.parse(localStorage.getItem('activeSessions')||'{}');
      _sess[email] = { name: currentUser.name, loginTime: new Date().toLocaleString() };
      localStorage.setItem('activeSessions', JSON.stringify(_sess));
      
      document.getElementById('loginPage').classList.remove('active');
      document.getElementById('appPage').classList.add('active');
      
      if (currentUser.role === "admin") {
        alert("Admin login successful!");
        document.getElementById('adminDashBtn').style.display = 'flex';
        if (!localStorage.getItem('adminDashboardShown')) { 
          renderAdminDashboard(); 
          localStorage.setItem('adminDashboardShown','true'); 
        }
      } else { 
        alert("Login successful!"); 
        openPage('home'); 
      }
      
      return;
    }
  } catch (error) {
    console.error('Backend login failed, trying localStorage:', error);
  }
  
  // Fallback to localStorage login
  if (users[email] && users[email].pass === pass) {
    currentUser = users[email];
    currentUser.education ||= "Add your school / college / company";
    currentUser.skills ||= ["HTML","CSS"];
    currentUser.certificates ||= [];
    localStorage.setItem('currentUser', email);
    
    const _sess = JSON.parse(localStorage.getItem('activeSessions')||'{}');
    _sess[email] = { name: users[email].name, loginTime: new Date().toLocaleString() };
    localStorage.setItem('activeSessions', JSON.stringify(_sess));
    
    document.getElementById('loginPage').classList.remove('active');
    document.getElementById('appPage').classList.add('active');
    
    if (currentUser.role === "admin") {
      alert("Admin login successful!");
      document.getElementById('adminDashBtn').style.display = 'flex';
      if (!localStorage.getItem('adminDashboardShown')) { 
        renderAdminDashboard(); 
        localStorage.setItem('adminDashboardShown','true'); 
      }
    } else { 
      alert("Login successful!"); 
      openPage('home'); 
    }
  } else { 
    document.getElementById('loginErr').innerText = "Invalid login"; 
  }
}

// Override registerUser function
async function registerUser() {
  const name = document.getElementById('regName').value.trim();
  const college = document.getElementById('regCollege').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const phone = document.getElementById('regPhone').value.trim();
  const pass = document.getElementById('regPass').value.trim();
  
  if (!/^\S+@\S+\.\S+$/.test(email)) { alert("Invalid email"); return; }
  if (!/^\d{10}$/.test(phone)) { alert("Invalid phone"); return; }
  
  try {
    // Try backend registration
    const response = await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass, phone, college })
    });
    
    if (response && response.success) {
      authToken = response.token;
      localStorage.setItem('authToken', authToken);
      
      // Save to localStorage as backup
      const newUser = response.user;
      newUser.pass = pass;
      newUser.verified = true;
      newUser.followers = [];
      newUser.following = [];
      newUser.certificates = [];
      newUser.savedPosts = [];
      newUser.likedPosts = [];
      newUser.commentedPosts = [];
      newUser.education = college;
      newUser.skills = [];
      
      users[email] = newUser;
      localStorage.setItem('users', JSON.stringify(users));
      
      alert("Registered successfully! You can login now.");
      showLogin();
      return;
    }
  } catch (error) {
    console.error('Backend registration failed, trying localStorage:', error);
  }
  
  // Fallback to localStorage registration
  if (users[email]) { alert("Email already registered"); return; }
  
  users[email] = { 
    name, college, email, phone, pass, 
    role:"user", verified:true, followers:[], following:[], 
    certificates:[], savedPosts:[], likedPosts:[], commentedPosts:[], 
    education:college, skills:[] 
  };
  localStorage.setItem('users', JSON.stringify(users));
  
  alert("Registered successfully! You can login now.");
  showLogin();
}

// Override renderPosts to fetch from backend
async function renderPosts() {
  const content = document.getElementById('content');
  content.innerHTML = '<h3 style="margin-bottom:4px;">Home Feed</h3><div style="text-align:center;padding:40px;"><div style="font-size:2rem;">⏳</div><p>Loading posts...</p></div>';
  
  try {
    // Fetch from backend
    const backendPosts = await apiCall('/posts');
    const backendUsers = await apiCall('/users');
    
    if (backendPosts && Array.isArray(backendPosts)) {
      posts = backendPosts;
      localStorage.setItem('posts', JSON.stringify(posts));
    } else {
      // Fallback to localStorage
      posts = JSON.parse(localStorage.getItem('posts')||'[]');
    }
    
    if (backendUsers) {
      Object.assign(users, backendUsers);
    } else {
      Object.assign(users, JSON.parse(localStorage.getItem('users')||'{}'));
    }
  } catch (error) {
    console.error('Failed to load from backend, using localStorage:', error);
    posts = JSON.parse(localStorage.getItem('posts')||'[]');
    Object.assign(users, JSON.parse(localStorage.getItem('users')||'{}'));
  }
  
  // Clear loading and render
  content.innerHTML = '<h3 style="margin-bottom:4px;">Home Feed</h3>';
  
  // Rest of renderPosts function continues as normal...
  // (The existing renderPosts code will continue from here)
}

// Override submitPost to save to backend
async function submitPost() {
  const pText = document.getElementById('pText'); 
  const pFile = document.getElementById('pFile');
  
  if (!pText.value && pFile.files.length === 0) { 
    alert("Post must contain text or media"); 
    return; 
  }
  
  const tags = extractHashtags(pText.value);
  if (tags.length > 6) { 
    alert(`Maximum 6 hashtags allowed. You used ${tags.length}.`); 
    return; 
  }
  
  if (!confirm("Publish this post?")) return;
  
  const selectedRadio = document.querySelector('input[name="mediaSelect"]:checked');
  const selectedIndex = selectedRadio ? Number(selectedRadio.value) : null;
  let media = [];
  
  for (let i = 0; i < pFile.files.length; i++) {
    const file = pFile.files[i]; 
    const id = crypto.randomUUID();
    const type = file.type.startsWith("image") ? "image" : file.type.startsWith("video") ? "video" : "audio";
    
    if (type === "video") { 
      await saveMediaToDB(id,file); 
      media.push({type,dbId:id,selected:i===selectedIndex}); 
    } else { 
      const base64 = await fileToBase64(file); 
      media.push({type,src:base64,selected:i===selectedIndex}); 
    }
  }
  
  const _newPost = { 
    id:crypto.randomUUID(), 
    user:currentUser.name, 
    userEmail:currentUser.email, 
    text:pText.value, 
    hashtags:tags, 
    media, 
    likes:[], 
    comments:[], 
    _ts: Date.now() 
  };
  
  // Save to backend
  try {
    await apiCall('/posts', {
      method: 'POST',
      body: JSON.stringify(_newPost)
    });
  } catch (error) {
    console.error('Failed to save post to backend:', error);
  }
  
  // Save to localStorage as backup
  posts.unshift(_newPost);
  localStorage.setItem("posts",JSON.stringify(posts));
  
  _activeHashtag = null;
  openPage('home');
}

console.log('✅ Backend API integration loaded');
console.log('🔗 API URL:', API_URL);
console.log('🔑 Auth Token:', authToken ? 'Present' : 'Not logged in');
