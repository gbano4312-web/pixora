# 📸 Pixora — Next-Gen Social Media Platform

Share **Photos**, **Videos**, and **Songs / Music** in a clean, professional, and elegant interface (Instagram + Spotify style).

---

## 🚀 1-Click Launch (Local)

1. Double-click **`Launch_Pixora.bat`** on your Desktop.
2. It will automatically start the backend server and open your browser at:
   👉 **`http://localhost:5000`**

---

## ✨ Features

- **Photos & Videos Feed:**
  - High-res photo display, video player with playback and loop controls.
  - Real-time Likes, Comments, Share to clipboard, and Save posts.
- **Songs & Audio Music Player:**
  - Dedicated audio cards for music artists and podcasters.
  - Play/Pause toggle, interactive seekbar, duration tracking, and volume controls.
- **Shorts & Reels:**
  - Full-height vertical video player (like Instagram Reels and TikTok) with sound toggle.
- **Direct Messaging (DMs):**
  - Private real-time chat with other creators.
- **User Profiles & Follow System:**
  - Followers, Following count, custom bio, and post tabs (All, Reels, Music).
- **Authentication:**
  - Secure JWT Authentication and Bcrypt password hashing for Login and Sign Up.
- **Design:**
  - Refined, clean dark-mode luxury aesthetic with Plus Jakarta Sans typography.

---

## 🌐 How to Host Pixora on the Internet (100% Free)

You can host Pixora on the web so that your friends can access it on their phones or laptops anywhere in the world.

### Step 1: Create a Free GitHub Repository
1. Go to [GitHub.com](https://github.com) and create a new repository named `pixora`.
2. In PowerShell inside the `pixora` folder:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit for Pixora"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/pixora.git
   git push -u origin main
   ```

### Step 2: Deploy to Render.com (Free)
1. Go to [Render.com](https://render.com) and sign up with your GitHub account.
2. Click **"New +"** -> **"Web Service"**.
3. Select your `pixora` repository.
4. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:**
     ```bash
     cd client && npm install && npm run build && cd ../server && npm install
     ```
   - **Start Command:**
     ```bash
     cd server && node server.js
     ```
5. Click **"Deploy Web Service"**!
6. In 2 minutes, Render will provide you with a live internet link (e.g., `https://pixora.onrender.com`)!
