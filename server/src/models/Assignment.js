const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard'],
        default: 'Easy'
    },
    description: {
        type: String,
        required: true
    },
    schemaSQL: {
        type: String, // The SQL to create tables/data for this assignment
        required: true
    },
    solutionSQL: {
        type: String, // The correct answer query
        select: false // Don't send to frontend by default
    },
    hints: [{
        type: String
    }],
    defaultCode: {
        type: String,
        default: '-- Write your query here\nSELECT * FROM table_name;'
    }
});

module.exports = mongoose.model('Assignment', assignmentSchema);
