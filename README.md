# CipherSQLStudio

A secure, interactive SQL playground with AI-powered hints.

## Setup

1. **Prerequisites**:
   - Node.js
   - PostgreSQL
   - MongoDB

2. **Environment Variables**:
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ciphersql
   PG_URI=postgresql://user:password@localhost:5432/ciphersql
   ```

3. **Install Dependencies**:
   ```bash
   cd server
   npm install
   cd ../client
   npm install
   ```

4. **Seed Database**:
   ```bash
   cd server
   node src/seed.js
   ```

5. **Run Application**:
   - Backend:
     ```bash
     cd server
     npm run dev
     ```
   - Frontend:
     ```bash
     cd client
     npm run dev
     ```

## Features
- **Monaco Editor**: VS Code-like SQL editing.
- **Sandboxed Execution**: Queries run in isolated PostgreSQL schemas.
- **AI Hints**: "Help" button provides conceptual clues.
