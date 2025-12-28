# CipherSQLStudio - Project Documentation

## 1. Introduction
**CipherSQLStudio** is a web-based platform designed to help users practice and master SQL (Structured Query Language). Think of it as a "LeetCode for SQL". Users can sign up, view SQL problems, write queries in an online editor, and execute them against a real database to see the results instantly.

This project is a **Full-Stack Application**, meaning it has both a **Frontend** (what you see) and a **Backend** (what processes your logic).

---

## 2. Tech Stack Setup (For Beginners)
Here are the tools and technologies used to build this project:

### Frontend (Client Side)
*   **React.js**: A library for building the user interface (UI). It makes the website dynamic and responsive.
*   **Vite**: A tool that helps run the React app very quickly during development.
*   **Sass (SCSS)**: An advanced version of CSS used for styling the website to make it look good.
*   **Monaco Editor**: The code editor component (same as VS Code) used in the browser for writing SQL.
*   **Axios**: Allows the frontend to talk to the backend (send requests).

### Backend (Server Side)
*   **Node.js**: Allows us to run JavaScript outside the browser (on the server).
*   **Express.js**: A framework for Node.js that makes building the server and API routes easier.
*   **Mongoose**: A library to interact with MongoDB.
*   **pg (node-postgres)**: A library to interact with PostgreSQL.

### Databases
This project uses **two** databases:
1.  **MongoDB**: Stores "Application Data" such as:
    *   Users (Sign up/Login info)
    *   Progress (Which problems updates you solved)
    *   Hints and Metadata
2.  **PostgreSQL**: Stores the "Problem Data".
    *   When you write a SQL query (e.g., `SELECT * FROM employees`), it runs inside this PostgreSQL database. This ensures you are practicing on a real SQL engine.

---

## 3. How It Works (Architecture Flow)
Here is the step-by-step flow of the application:

1.  **User Action**: You open the website in your browser (Client).
2.  **Frontend**: You click on an assignment. The React app uses **Axios** to ask the **Server** for details.
3.  **Backend (API)**: The Express server receives the request.
    *   It checks who you are (Authentication).
    *   It fetches the problem details from **MongoDB**.
4.  **Writing Code**: You type `SELECT * FROM table` in the editor.
5.  **Execution**:
    *   You click "Run".
    *   Frontend sends your SQL code to the Backend.
    *   Backend takes your SQL and runs it inside the **PostgreSQL** database.
    *   PostgreSQL returns the rows (data).
6.  **Result**: Backend sends the data back to Frontend, and you see the table on your screen.

---

## 4. Project Folder Structure
Here is where everything lives:

### `client/` (Frontend)
*   `src/main.jsx`: The starting point of the React app.
*   `src/App.jsx`: Handles the main routing (which page to show).
*   `src/pages/`: Contains full pages like `Home`, `Login`, `Assignment`.
*   `src/components/`: Reusable building blocks like `Navbar`, `CodeEditor`.
*   `src/context/`: Manages global state (like if the user is logged in).

### `server/` (Backend)
*   `src/app.js`: The main server file. This starts the backend.
*   `src/db.js`: Handles connecting to both MongoDB and PostgreSQL.
*   `src/routes/`: Functionality is split into "routes".
    *   `auth.js`: Login/Signup logic.
    *   `assignments.js`: Get/Create SQL problems.
    *   `execute.js`: The most important file! It runs the user's SQL code.
*   `src/models/`: Defines how data looks in MongoDB (e.g., User Schema).
*   `src/seed.js`: A script to populate the database with initial problems.
*   `src/init_db.js`: A script to create the PostgreSQL database if it doesn't exist.

---

## 5. Key Features
*   **Authentication**: Users can register and login securely. Passwords are encrypted.
*   **Code Persistence**: The app saves your code automatically so you don't lose it if you refresh.
*   **Hints System**: Users can view hints if they get stuck.
*   **Real SQL Execution**: Unlike some apps that "fake" it, this runs your code on a real Postgres database.

---

## 6. How to Run This Project
If you are a beginner and want to run this on your machine:

1.  **Prerequisites**: Install Node.js, MongoDB, and PostgreSQL on your computer.
2.  **Install Dependencies**:
    *   Open terminal in `server` folder: `npm install`
    *   Open terminal in `client` folder: `npm install`
3.  **Setup Environment (.env)**:
    *   Create a `.env` file in `server/` with your Database URLs (MONGO_URI, PG_URI).
4.  **Initialize Database**:
    *   Run `node src/init_db.js` (Creates Postgres DB).
    *   Run `node src/seed.js` (Fills MongoDB with problems).
5.  **Start the App**:
    *   Terminal 1 (Server): `npm run dev`
    *   Terminal 2 (Client): `npm run dev`
6.  **Open Browser**: Go to `http://localhost:5173` (usually).

---
*Created by [Your Name/Team] for [Project Purpose/Hackathon]*
