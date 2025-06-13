const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${req.user}-${Date.now()}.jpg`;
        cb(null, uniqueName);
    }
});

// Middleware to handle file uploads
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            cb(new Error('Only .jpg files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    }
});

// Get user profile - matches /api/user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('-passwordHash');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update user profile - matches /api/user
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { email, firstName, lastName, birthday, biography, favoriteNumber } = req.body;

        if (email) {
            // Validate email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: 'Invalid email format' });
            }
        }
        
        // Update user data
        const updateData = {};
        if (email) updateData.email = email;
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (birthday) updateData.birthday = new Date(birthday);
        if (biography !== undefined) updateData.biography = biography;
        if (favoriteNumber !== undefined) updateData.favoriteNumber = parseInt(favoriteNumber);

        const user = await User.findByIdAndUpdate(
            req.user,
            updateData,
            { new: true, runValidators: true }
        ).select('-passwordHash');
        
        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Upload profile picture - matches /api/user/picture
router.post('/picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Store the full URL path for the image
        const profilePictureUrl = `http://localhost:3000/uploads/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            req.user,
            { profilePicture: profilePictureUrl },
            { new: true }
        ).select('-passwordHash');

        res.json({
            message: 'Profile picture uploaded successfully', 
            profilePicture: user.profilePicture 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;