const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_prod';

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Please enter all fields' });
        }

        const existingAccount = await User.findOne({
            $or: [
                { email: email },
                { username: username }
            ]
        });

        if (existingAccount) {
            if (existingAccount.email === email) {
                return res.status(400).json({ error: 'User already exists' });
            }
            if (existingAccount.username === username) {
                return res.status(400).json({ error: 'Username is already taken' });
            }
        }

        const accountToCreate = new User({
            username,
            email,
            password
        });

        const persistedUser = await accountToCreate.save();

        const token = jwt.sign(
            { id: persistedUser._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: persistedUser._id,
                username: persistedUser.username,
                email: persistedUser.email
            }
        });

    } catch (err) {
        console.error(err);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ error: messages.join(', ') });
        }
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Please enter all fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User does not exist' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// @route   GET /api/auth/user
// @desc    Get user data (check if logged in)
// @access  Private (Needs middleware, strictly speaking, but simpler check for now)
router.get('/user', async (req, res) => {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        res.json(user);
    } catch (e) {
        res.status(400).json({ msg: 'Token is not valid' });
    }
});

module.exports = router;
