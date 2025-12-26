const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { code, assignmentId, context } = req.body;

    // Mock response for now
    // In real implementation, call OpenAI/Gemini API here

    const hints = [
        "Have you checked your WHERE clause?",
        "Remember to JOIN the tables on the common key.",
        "The GROUP BY clause must include all non-aggregated columns.",
        "Try using a subquery to filter the results first."
    ];

    const randomHint = hints[Math.floor(Math.random() * hints.length)];

    // Simulate API delay
    setTimeout(() => {
        res.json({ hint: `Simulated AI Hint: ${randomHint}` });
    }, 1000);
});

module.exports = router;
