# 🚀 FoodieHub Deployment Guide

This guide walks you through deploying the **Backend (Node.js + MongoDB)** and the **Frontend (Static HTML/JS)** to production.

---

## Part 1: Deploy the Backend (Recommended: Render or Railway)

Deploying to **[Render.com](https://render.com)** (Free Web Service):

1. **Create a New Web Service**:
   - Sign up / Log in to [Render](https://render.com).
   - Click **New +** -> **Web Service**.
   - Connect your GitHub repository.

2. **Configure Service Settings**:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (or `node index.js`)
   - **Instance Type**: Free

3. **Set Environment Variables** (under *Advanced* or *Environment* tab):
   - `MONGO_DB_URI`: `mongodb+srv://sakshiwale:sakshi09@cluster0.frwilis.mongodb.net/onlinefood?appName=Cluster0`
   - `JWT_SECRET`: `qwertyuiop1234567890asdfghjkl!@$%^&*zxcvbnm`
   - `PORT`: `5000` *(Render sets this automatically)*
   - `FRONTEND_URL`: *(Optional: set to your Vercel URL once deployed)*

4. **Deploy**:
   - Click **Create Web Service**.
   - Wait for build to complete.
   - Copy your live backend URL (e.g., `https://foodiehub-backend.onrender.com`).

---

## Part 2: Connect Frontend to Your Live Backend

Open `frontend_09_realtime/assets/app.js` and set your backend URL:

```javascript
// frontend_09_realtime/assets/app.js (Line 10)
const PROD_BACKEND_URL = "https://your-backend-app.onrender.com";
```

*(When running locally on `localhost` or `127.0.0.1`, `app.js` automatically uses `http://127.0.0.1:5000` without any changes needed!)*

---

## Part 3: Deploy Frontend to Vercel

1. **Go to [Vercel](https://vercel.com)**:
   - Click **Add New...** -> **Project**.
   - Select your GitHub repository.

2. **Configure Project Settings**:
   - **Root Directory**: Click *Edit* and select **`frontend_09_realtime`**.
   - **Framework Preset**: `Other` (or `Vite`).
   - If using `Other`, you can leave Build Command empty; `vercel.json` and all static HTML files will be served directly.
   - If using `Vite`, Build Command will run `vite build` using the configured `vite.config.js`.

3. **Click Deploy**:
   - Your site will deploy with clean URLs enabled (`/adminlogin` and `/adminlogin.html` both work).

---

## Part 4: Admin Credentials & Login

- **Admin Login Page**:
  `https://your-site.vercel.app/adminlogin.html` (or `/adminlogin`)
- **Email**: `admin@gmail.com`
- **Password**: *(The password you used when creating the account)*
- **Dashboard**: Upon login, you will automatically be redirected to `admindashbord.html`.
