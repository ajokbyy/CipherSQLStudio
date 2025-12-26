const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Setup
const { connectMongo } = require('./db');
connectMongo();

// Routes
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/execute', require('./routes/execute'));
app.use('/api/hints', require('./routes/hints'));


// Routes Placeholder
app.get('/', (req, res) => {
  res.send('CipherSQLStudio Backend is running');
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
