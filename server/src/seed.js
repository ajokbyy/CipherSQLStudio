const mongoose = require('mongoose');
const { Pool } = require('pg');
const Assignment = require('./models/Assignment');
require('dotenv').config();

const seedAssignments = [
    {
        title: 'High Earners',
        difficulty: 'Easy',
        description: 'Retrieve all employees who earn more than $80,000. Return their names and salaries.',
        schemaSQL: `
      CREATE TABLE employees (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        department VARCHAR(50),
        salary INT
      );
      INSERT INTO employees (name, department, salary) VALUES
      ('Alice', 'Engineering', 90000),
      ('Bob', 'HR', 50000),
      ('Charlie', 'Engineering', 120000),
      ('David', 'Marketing', 75000),
      ('Eve', 'Engineering', 80000);
    `,
        defaultCode: '-- Select employees with salary > 80000\nSELECT name, salary FROM employees WHERE ...'
    },
    {
        title: 'Department Headcounts',
        difficulty: 'Medium',
        description: 'Find the number of employees in each department. Result should have columns "department" and "count".',
        schemaSQL: `
        CREATE TABLE employees (
          id SERIAL PRIMARY KEY,
          name VARCHAR(100),
          department VARCHAR(50),
          salary INT
        );
        INSERT INTO employees (name, department, salary) VALUES
        ('Alice', 'Engineering', 90000),
        ('Bob', 'HR', 50000),
        ('Charlie', 'Engineering', 120000),
        ('David', 'Marketing', 75000),
        ('Eve', 'Engineering', 80000),
        ('Frank', 'HR', 60000);
      `,
        defaultCode: '-- Count employees per department\nSELECT ...'
    }
];

const seed = async () => {
    try {
        // 1. Connect and Seed Mongo
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Clearing old assignments...');
        await Assignment.deleteMany({});

        console.log('Seeding new assignments...');
        const createdAssignments = await Assignment.insertMany(seedAssignments);
        console.log(`Seeded ${createdAssignments.length} assignments in MongoDB`);

        // 2. Connect and Seed PG Schemas
        console.log('Connecting to PostgreSQL...');
        const pool = new Pool({ connectionString: process.env.PG_URI });
        const client = await pool.connect();

        for (const ass of createdAssignments) {
            const schemaName = `assignment_${ass._id}`;
            console.log(`Setting up schema: ${schemaName}`);

            // Reset schema
            await client.query(`DROP SCHEMA IF EXISTS "${schemaName}" CASCADE`);
            await client.query(`CREATE SCHEMA "${schemaName}"`);

            // Create tables in that schema
            await client.query(`SET search_path TO "${schemaName}"`);
            await client.query(ass.schemaSQL);
        }

        console.log('PostgreSQL schemas seeded successfully');
        client.release();
        pool.end();
        mongoose.connection.close();

    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seed();
