# AuraNotes

<p align="center">
  <img src="client/public/whitelogo.png" alt="AuraNotes logo" width="180" />
</p>

<p align="center">
  A premium note and task workspace built with React, Vite, Node.js, MongoDB, Framer Motion, and Tiptap.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47a248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
</p>

## ✨ Features

- 🎨 Theme-aware UI with animated backgrounds and polished glass-style panels
- 📝 Rich text note editor powered by Tiptap
- 🧠 Three note views: 3D cards, components, and list mode
- 🖱️ Right-click context actions for rename, pin, category, color, and delete
- 📌 Pinned notes and custom categories
- ✅ Todo widget with priorities and completion progress
- 🔐 Authentication flow with token-based session persistence
- 🕘 Note history and revert support
- ⚡ Lazy-loaded UI pieces for a faster initial experience

## 🧱 Project Structure

```text
NoteApp/
├── client/   # React + Vite frontend
├── server/   # Express API + MongoDB models and routes
├── README.md # Project overview
└── .gitignore
```

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd NoteApp
```

### 2. Set up the server

```bash
cd server
npm install
```

Create a `.env` file in `server/` with your environment values, for example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Start the API:

```bash
npm run dev
```

### 3. Set up the client

```bash
cd ../client
npm install
```

If needed, create a `.env` file in `client/`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

## 🎯 What You Can Do

- Create and organize notes by category and color
- Edit notes in a rich document editor
- Switch between visual note layouts
- Manage tasks in the built-in todo panel
- Revert notes to earlier versions
- Use dark or light mode with animated theme styling

## 🛠 Tech Stack

- Frontend: React, Vite, Framer Motion, Lucide React, Tiptap, Axios
- Backend: Node.js, Express
- Database: MongoDB
- Styling: Tailwind CSS

## 📦 Available Scripts

### Client

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

### Server

```bash
npm run dev
```

## 🔒 Notes

- Do not commit `.env` files or other local secrets.
- The repo-level `.gitignore` already excludes common build artifacts and environment files.

## 🙌 Credits

Built as a modern note-taking workspace focused on readability, motion, and a high-end UI feel.