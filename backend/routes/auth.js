const express = require('express');
const bcrypt = require('bcrypt'); 
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    console.log('Registration request received:', req.body);
    
    try {
        const { username, email, password, firstName, lastName, birthday, biography, favoriteNumber } = req.body;
        
        if (!username || !email || !password || !firstName || !lastName || !birthday || favoriteNumber === undefined) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);  

        // Create new user 
        const newUser = new User({
            username,
            email,
            passwordHash: passwordHash,  
            firstName,
            lastName,
            birthday: new Date(birthday),
            biography: biography || '',  
            favoriteNumber: parseInt(favoriteNumber)
        });
        
        await newUser.save();

        // Generate JWT token 
        const token = jwt.sign(
            { userId: newUser._id },  
            process.env.JWT_SECRET || 'your-secret-key', 
            { expiresIn: '7d' }  
        );
        
        res.status(201).json({ 
            message: 'User registered successfully', 
            token, 
            user: {
                id: newUser._id, 
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.passwordHash); 
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token 
        const token = jwt.sign(
            { userId: user._id },  
            process.env.JWT_SECRET || 'secret-key', 
            { expiresIn: '7d' }
        );
        
        res.json({ 
            message: 'Login successful', 
            token, 
            user: { 
                id: user._id, 
                username: user.username, 
                email: user.email 
            } 
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;