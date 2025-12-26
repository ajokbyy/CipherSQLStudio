const mongoose = require('mongoose');
const { Pool } = require('pg');

// MongoDB Connection
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        // Don't exit process, just log error so app can still run partially if needed
    }
};

// PostgreSQL Connection
const pool = new Pool({
    connectionString: process.env.PG_URI,
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
});

const query = (text, params) => pool.query(text, params);
const getClient = () => pool.connect();

module.exports = {
    connectMongo,
    query,
    getClient,
    pool
};
