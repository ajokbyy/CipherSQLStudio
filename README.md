# 🚀 CipherSQLStudio

**CipherSQLStudio** is a secure, interactive SQL playground designed to help beginners and developers master SQL. Think of it as a "LeetCode for SQL" where you can write queries, execute them against a real database, and get instant feedback with AI-powered hints.

---

## 📖 Table of Contents
1. [How It Works](#how-it-works)
2. [Project Architecture](#project-architecture)
3. [Folder Structure](#folder-structure)
4. [Tech Stack](#tech-stack)
5. [Getting Started (Setup Guide)](#getting-started-setup-guide)
6. [Features](#features)

---

## <a name="how-it-works"></a> 🛠 How It Works

1. **User Interaction**: Users log in and select a SQL problem from the dashboard.
2. **Request Handling**: Upon selection, the **React Frontend** fetches the problem details (description, schema) from the **MongoDB** database via the **Express Backend**.
3. **Coding**: The user writes a SQL query in the embedded **Monaco Editor**.
4. **Execution**:
    *   The user clicks "Run".
    *   The query is sent to the backend.
    *   The backend executes this query safely inside a **PostgreSQL** database environment.
    *   Results (rows/tables) are returned to the frontend.
5. **Feedback**: The user sees the output table immediately. If stuck, they can request an AI hint.

---

## <a name="project-architecture"></a> 🏗 Project Architecture

This is a **Full-Stack Application** split into two main parts:

*   **Client (Frontend)**: The visual part of the app. It handles user input, displays problems, and renders the code editor.
*   **Server (Backend)**: The brain of the app. It handles API requests, manages authentication, communicates with databases, and executes the user's SQL code.

**Data Flow:**
`Client (React)` ↔ `API (Express)` ↔ `Databases (MongoDB & PostgreSQL)`

---

## <a name="folder-structure"></a> 📂 Folder Structure

The project is organized into two main directories: `client` and `server`.

```bash
Cipher_Assiment/
├── client/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI blocks (Navbar, Editor)
│   │   ├── context/        # Global state (AuthContext)
│   │   ├── pages/          # Full application pages (Home, Login)
│   │   ├── App.jsx         # Main Layout & Routing
│   │   └── main.jsx        # Entry point
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
│
├── server/                 # Backend (Node + Express)
│   ├── src/
│   │   ├── models/         # MongoDB Schemas (User, Assignment)
│   │   ├── routes/         # API Endpoints (auth, execute, hints)
│   │   ├── app.js          # Express App setup
│   │   ├── db.js           # Database connections (Mongo + PG)
│   │   ├── init_db.js      # Script to create Postgres DB
│   │   └── seed.js         # Script to seed initial data
│   ├── .env                # Environment variables (IGNORED IN GIT)
│   └── package.json        # Backend dependencies
│
└── README.md               # You are reading this!
```

---

## <a name="tech-stack"></a> 💻 Tech Stack

### Frontend
*   **React.js**: For building interactive UI.
*   **Vite**: For fast development and building.
*   **Sass (SCSS)**: For styling.
*   **Monaco Editor**: The powerful code editor engine (same as VS Code).
*   **Axios**: For making API calls.

### Backend
*   **Node.js & Express**: Runtime and framework for the API.
*   **PostgreSQL**: The Relational Database engine where user queries are executed.
*   **MongoDB**: The NoSQL Database for storing user profiles, problem descriptions, and hints.
*   **Mongoose**: MongoDB object modeling tool.
*   **node-postgres (pg)**: PostgreSQL client for Node.js.

---

## <a name="getting-started-setup-guide"></a> 🚀 Getting Started (Setup Guide)

Follow these steps to get the project running on your local machine.

### Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [PostgreSQL](https://www.postgresql.org/)
*   [MongoDB](https://www.mongodb.com/) (running locally or a cloud URI)

### Step 1: Clone & Install Dependencies

**Terminal 1 (Server):**
```bash
cd server
npm install
```

**Terminal 2 (Client):**
```bash
cd client
npm install
```

### Step 2: Configure Environment Variables

Create a file named `.env` inside the `server/` directory and add your database configurations:

```env
PORT=5000
# Connection string for your local or cloud MongoDB
MONGO_URI=mongodb://localhost:27017/ciphersql
# Connection string for your local PostgreSQL (format: postgresql://user:password@host:port/database)
PG_URI=postgresql://postgres:yourpassword@localhost:5432/ciphersql
JWT_SECRET=your_super_secret_key_here
```

### Step 3: Initialize & Seed Databases

Before running the app, we need to creating the databases and fill them with data.

1.  **Initialize PostgreSQL Database**:
    ```bash
    # Inside server/ directory
    node src/init_db.js
    ```
    *This creates the `ciphersql` database in Postgres if it doesn't exist.*

2.  **Seed Data (Problems & Hints)**:
    ```bash
    # Inside server/ directory
    node src/seed.js
    ```
    *This populates MongoDB with the SQL assignments.*

### Step 4: Run the Application

You need to run both the frontend and backend servers.

**Terminal 1 (Server):**
```bash
cd server
npm run dev
```

**Terminal 2 (Client):**
```bash
cd client
npm run dev
```

### Step 5: Access the App
Open your browser and visit: `http://localhost:5173` (or the URL shown in your client terminal).

---

## <a name="features"></a> ✨ Features
*   **Real-time SQL Execution**: Queries run against a live Postgres database.
*   **Auto-Save**: Your code is saved automatically to local storage.
*   **Secure Authentication**: User accounts protected with JWT and password hashing.
*   **Hints System**: Integrated help to guide you through tough problems.
*   **Modern UI**: Clean, dark-themed interface inspired by professional IDEs.
