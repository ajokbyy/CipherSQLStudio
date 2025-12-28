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
        // Fetch the assignment and its secret solution
        const assignment = await Assignment.findById(assignmentId).select('+solutionSQL');
        const schemaName = `assignment_${assignmentId}`;

        // 1. Transaction Start
        // We use a transaction to ensure any changes made by the user's query (if they managed to modify data)
        // are rolled back and don't affect the permanent state for other users.
        await client.query('BEGIN');

        // 2. Set Environment
        // Restrict the search path to the specific assignment schema to prevent accessing other tables.
        await client.query(`SET search_path TO "${schemaName}", public`);
        await client.query(`SET statement_timeout = 2000`); // 2s timeout to prevent DOS

        const startTime = Date.now();
        let validation = null;

        // 3. Execute Candidate Query
        // We run the user's code first to capture their result and time execution.
        const executionResult = await client.query(code);
        const queryRuntime = Date.now() - startTime;

        // 4. Verify Against Solution (if exists)
        if (assignment && assignment.solutionSQL) {
            // Run the official solution to get the expected output
            const correctAnswer = await client.query(assignment.solutionSQL);
            const passed = verifyResults(executionResult, correctAnswer);

            validation = {
                status: passed ? 'Accepted' : 'Wrong Answer',
                runtime: queryRuntime,
                userOutput: executionResult.rows,
                expectedOutput: correctAnswer.rows,
                comparison: passed
            };
        }

        // 5. Cleanup
        // Always rollback to keep the database clean
        await client.query('ROLLBACK');

        res.json({
            rows: executionResult.rows,
            rowCount: executionResult.rowCount,
            fields: executionResult.fields.map(f => f.name),
            command: executionResult.command,
            validation
        });

    } catch (err) {
        // Ensure we rollback if an error occurs during execution
        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) {
            console.error('Failed to rollback transaction:', rollbackErr);
        }

        res.status(400).json({
            error: err.message,
            validation: {
                status: 'Runtime Error',
                error: err.message
            }
        });
    } finally {
        client.release();
    }
});

/**
 * Compares the user's result against the correct answer.
 * Optimization: Canonicalizes and stringifies rows *before* sorting to avoid 
 * repeated JSON.stringify calls during the O(N log N) sort.
 */
function verifyResults(userResult, solResult) {
    if (userResult.rowCount !== solResult.rowCount) {
        return false;
    }

    // Helper to turn a row object into a deterministic string key
    // e.g. { b: 1, a: 2 } -> '{"a":2,"b":1}'
    const canonicalize = (row) => {
        const sortedKeys = Object.keys(row).sort();
        const obj = {};
        for (const key of sortedKeys) {
            obj[key] = row[key];
        }
        return JSON.stringify(obj);
    };

    // Pre-calculate strings for O(N) prep cost
    const userRows = userResult.rows.map(canonicalize);
    const solRows = solResult.rows.map(canonicalize);

    // Sort strings: O(N log N)
    userRows.sort();
    solRows.sort();

    // Linear compare: O(N)
    for (let i = 0; i < userRows.length; i++) {
        if (userRows[i] !== solRows[i]) {
            return false;
        }
    }

    return true;
}

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
