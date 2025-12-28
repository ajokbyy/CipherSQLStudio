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

    // Shuffle and pick 3 unique hints
    const shuffled = hints.sort(() => 0.5 - Math.random());
    const selectedHints = shuffled.slice(0, 3);

    // Simulate API delay
    setTimeout(() => {
        res.json({ hints: selectedHints });
    }, 1000);
});

module.exports = router;
