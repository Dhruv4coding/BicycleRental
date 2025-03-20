const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Admin = require('../models/Admin');
const Bicycle = require('../models/Bicycle');
const Booking = require('../models/Booking');
const adminAuth = require('../middleware/adminAuth');

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await admin.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get admin profile
router.get('/profile', adminAuth, async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.json(admin);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all bicycles
router.get('/bicycles', adminAuth, async (req, res) => {
    try {
        const bicycles = await Bicycle.find();
        res.json(bicycles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new bicycle
router.post('/bicycles', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const bicycleData = {
            name: req.body.name,
            type: req.body.type,
            description: req.body.description || '',
            price: Number(req.body.price),
            location: req.body.location,
            status: 'available',
            image: req.file ? `/uploads/${req.file.filename}` : null
        };

        // Validate required fields
        const requiredFields = ['name', 'type', 'price', 'location'];
        const missingFields = requiredFields.filter(field => !bicycleData[field] || bicycleData[field].toString().trim() === '');

        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing required fields: ${missingFields.join(', ')}`
            });
        }

        const bicycle = new Bicycle(bicycleData);
        await bicycle.save();
        res.status(201).json(bicycle);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: error.message || 'Server error',
            errors: error.errors
        });
    }
});

// Update bicycle
router.put('/bicycles/:id', adminAuth, upload.single('image'), async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            type: req.body.type,
            description: req.body.description || '',
            price: Number(req.body.price),
            location: req.body.location,
            status: req.body.status
        };

        if (req.file) {
            updateData.image = `/uploads/${req.file.filename}`;
        }

        const bicycle = await Bicycle.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        if (!bicycle) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }
        res.json(bicycle);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Server error' });
    }
});

// Delete bicycle
router.delete('/bicycles/:id', adminAuth, async (req, res) => {
    try {
        const bicycle = await Bicycle.findById(req.params.id);
        if (!bicycle) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }

        // Delete image file if it exists
        if (bicycle.image) {
            const imagePath = path.join(__dirname, '..', 'uploads/bicycles', path.basename(bicycle.image));
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Bicycle.findByIdAndDelete(req.params.id);
        res.json({ message: 'Bicycle deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all bookings
router.get('/bookings', adminAuth, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('bicycle', 'name type price');
        res.json(bookings);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update booking status
router.put('/bookings/:id', adminAuth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const { status } = req.body;
        booking.status = status;

        // Update bicycle status based on booking status
        const bicycle = await Bicycle.findById(booking.bicycle);
        if (bicycle) {
            bicycle.status = status === 'completed' ? 'available' : 'rented';
            await bicycle.save();
        }

        await booking.save();
        res.json(booking);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router; 