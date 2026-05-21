# TaskFlow | Premium MERN Workspace

TaskFlow is a state-of-the-art task orchestration platform built with the MERN stack. It features a stunning premium dark interface, real-time synchronization, and an elite user experience designed for high-performance productivity.

## ✨ Premium Features
- **Elite Dark UI:** A custom-engineered deep black interface with glassmorphic elements and CSS-native animations.
- **Real-Time Orchestration:** Instant state synchronization across all active sessions powered by Socket.IO.
- **Secure Authentication:** Enterprise-grade security with JWT, bcrypt password hashing, and protected route architecture.
- **Fluid CRUD:** Seamlessly manage tasks with a highly interactive, responsive interface.
- **Intelligent Status:** Visual status tracking with automated overdue highlighting and deadline management.
- **Premium Aesthetics:** Curated typography (Outfit & Inter), smooth gradients, and micro-interactions.

## 🚀 Tech Stack
- **Frontend:** React 19, Tailwind CSS 4, React Query, Axios, Lucide Icons.
- **Backend:** Node.js, Express, MongoDB Atlas, Mongoose, Socket.io.
- **Security:** JWT (JSON Web Tokens), Bcrypt.js, Helmet, Express-Rate-Limit.

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (or local MongoDB instance)

### Installation & Setup

1. **Backend Configuration:**
   ```bash
   cd backend
   npm install
   ```
   Configure your `.env` file with the provided secure keys:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_secure_generated_secret
   JWT_EXPIRES_IN=30d
   NODE_ENV=development
   ```

2. **Frontend Configuration:**
   ```bash
   cd frontend
   npm install
   ```

### Execution

1. **Launch Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Launch Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

Access the application at `http://localhost:5173`.

## 📂 Project Architecture
- `backend/`: Scalable Express API with real-time event emitters.
- `frontend/`: Modern React workspace with a centralized design system.

