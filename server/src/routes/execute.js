const express = require('express');
const router = express.Router();
const { getClient } = require('../db');
const Assignment = require('../models/Assignment');

router.post('/', async (req, res) => {
    const { code, assignmentId } = req.body;

    if (!code || !assignmentId) {
        return res.status(400).json({ error: 'Missing code or assignmentId' });
    }

    const client = await getClient();

    try {
        // 1. Fetch Assignment to know the schema context (simulated or real)
        // For this MVP, we assume a schema named 'assignment_{id}' exists.
        // In a real app, we'd ensure this schema is seeded.
        const schemaName = `assignment_${assignmentId}`;

        // 2. Start Transaction
        await client.query('BEGIN');

        // 3. Set Search Path to the specific assignment schema
        // This sandbox ensures queries only run against this assignment's tables
        await client.query(`SET search_path TO "${schemaName}", public`);

        // 4. Execute User Query
        // We limit execution time to prevent infinite loops/DoS
        const result = await client.query(`SET statement_timeout = 2000`); // 2 seconds

        // Execute the actual user code
        const queryResult = await client.query(code);

        // 5. Rollback changes so the DB stays clean
        await client.query('ROLLBACK');

        // 6. Return results
        // If it's a SELECT, return rows. If INSERT/UPDATE, return rowCount.
        res.json({
            rows: queryResult.rows,
            rowCount: queryResult.rowCount,
            fields: queryResult.fields.map(f => f.name),
            command: queryResult.command
        });

    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (e) { console.error('Rollback error', e); }

        res.status(400).json({ error: err.message });
    } finally {
        client.release();
    }
});

// Admin endpoint to seed the schema for an assignment
router.post('/seed/:id', async (req, res) => {
    const { id } = req.params;
    const client = await getClient();
    try {
        const assignment = await Assignment.findById(id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        const schemaName = `assignment_${id}`;
        await client.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
        await client.query(`SET search_path TO "${schemaName}"`);
        await client.query(assignment.schemaSQL); // Run the table creation/seeding SQL

        res.json({ message: `Schema ${schemaName} seeded successfully` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

module.exports = router;
