const express = require('express');
const router = express.Router();
const Attempt = require('../models/Attempt');
const Assignment = require('../models/Assignment');
const { getClient } = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_prod';

// Middleware to check auth
const auth = (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
};

// @route   POST /api/attempts
// @desc    Save a new attempt
// @access  Private
router.post('/', auth, async (req, res) => {
    const { assignmentId, code } = req.body; // Status determines by backend now

    try {
        const assignment = await Assignment.findById(assignmentId).select('+solutionSQL');
        if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

        let status = 'Error';

        // Verification Logic
        if (assignment.solutionSQL) {
            const client = await getClient();
            try {
                const schemaName = `assignment_${assignmentId}`;
                await client.query('BEGIN');
                await client.query(`SET search_path TO "${schemaName}", public`);
                await client.query(`SET statement_timeout = 2000`);

                const startTime = Date.now();
                // Run Solution
                const solResult = await client.query(assignment.solutionSQL);

                // Run User Code
                const userResult = await client.query(code);
                const queryRuntime = Date.now() - startTime;

                await client.query('ROLLBACK');

                // Compare
                // 1. Check Row Count
                let passed = false;
                if (solResult.rowCount === userResult.rowCount) {
                    const sortRows = (rows) => {
                        return rows.map(r => {
                            const ordered = {};
                            Object.keys(r).sort().forEach(key => ordered[key] = r[key]);
                            return ordered;
                        }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
                    };

                    const solRowsSorted = sortRows(solResult.rows);
                    const userRowsSorted = sortRows(userResult.rows);

                    if (JSON.stringify(solRowsSorted) === JSON.stringify(userRowsSorted)) {
                        passed = true;
                    }
                }

                if (passed) {
                    status = 'Success';
                } else {
                    status = 'Incorrect';
                }

                // Store results for response (don't save huge data to DB usually, but for now send back to client)
                res.json({
                    attempt: await new Attempt({
                        user: req.user.id,
                        assignment: assignmentId,
                        code,
                        status
                    }).save(),
                    validation: {
                        status: passed ? 'Accepted' : 'Wrong Answer',
                        runtime: queryRuntime,
                        userOutput: userResult.rows,
                        expectedOutput: solResult.rows,
                        comparison: passed
                    }
                });
                return; // Return early

            } catch (e) {
                console.error("Verification Error:", e);
                try { await client.query('ROLLBACK'); } catch (_) { }
                status = 'Error'; // SQL Error
                res.json({
                    attempt: await new Attempt({
                        user: req.user.id,
                        assignment: assignmentId,
                        code,
                        status
                    }).save(),
                    validation: {
                        status: 'Runtime Error',
                        error: e.message
                    }
                });
                return;
            } finally {
                client.release();
            }
        } else {
            // No solution to check against, default to success if it runs?
            // Or just keep the status passed from frontend?
            // For now, if no solution, we mark as 'Pending' or just 'Success' if passed.
            // Let's assume Success if no solution defined (e.g. playground)
            status = 'Success';
            const newAttempt = new Attempt({
                user: req.user.id,
                assignment: assignmentId,
                code,
                status
            });
            const attempt = await newAttempt.save();
            res.json({ attempt });
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/attempts/:assignmentId
// @desc    Get user attempts for an assignment
// @access  Private
router.get('/:assignmentId', auth, async (req, res) => {
    try {
        const attempts = await Attempt.find({
            user: req.user.id,
            assignment: req.params.assignmentId
        }).sort({ timestamp: -1 });

        res.json(attempts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
