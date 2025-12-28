const { Client } = require('pg');
require('dotenv').config();

const initDB = async () => {
    try {
        // Parse the original URI
        // e.g. postgresql://user:pass@localhost:5432/ciphersql
        const originalUri = process.env.PG_URI;
        if (!originalUri) {
            throw new Error('PG_URI is undefined in .env');
        }

        // Connect to 'postgres' database to perform administrative tasks
        // We assume the URI ends with /database_name
        const dbName = 'ciphersql';
        const maintenanceUri = originalUri.replace(`/${dbName}`, '/postgres');

        console.log(`Connecting to maintenance DB...`);
        const client = new Client({ connectionString: maintenanceUri });
        await client.connect();

        // Check if DB exists
        const checkRes = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${dbName}'`);
        if (checkRes.rowCount === 0) {
            console.log(`Database "${dbName}" does not exist. Creating...`);
            // CREATE DATABASE cannot run in a transaction block, so we run it directly
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully!`);
        } else {
            console.log(`Database "${dbName}" already exists.`);
        }

        await client.end();
    } catch (err) {
        console.error('Error initializing database:', err.message);
        console.log('Hint: Ensure your PG_URI in server/.env has the correct username and password.');
    }
};

initDB();
