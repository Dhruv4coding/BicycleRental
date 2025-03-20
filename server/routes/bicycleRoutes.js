const express = require('express');
const router = express.Router();
const Bicycle = require('../models/Bicycle');
const { auth, isAdmin } = require('../middleware/auth');

// Get all bicycles
router.get('/', async (req, res) => {
    try {
        const bicycles = await Bicycle.find({ status: 'available' });
        res.json(bicycles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bicycles', error: error.message });
    }
});

// Search bicycles
router.get('/search', async (req, res) => {
    try {
        const { type, minPrice, maxPrice, location } = req.query;
        const query = { status: 'available' };

        if (type) query.type = type;
        if (location) query.location = location;
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        const bicycles = await Bicycle.find(query);
        res.json(bicycles);
    } catch (error) {
        res.status(500).json({ message: 'Error searching bicycles', error: error.message });
    }
});

// Get bicycle by ID
router.get('/:id', async (req, res) => {
    try {
        const bicycle = await Bicycle.findById(req.params.id);
        if (!bicycle) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }
        res.json(bicycle);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bicycle', error: error.message });
    }
});

// Create new bicycle (admin only)
router.post('/', auth, isAdmin, async (req, res) => {
    try {
        const bicycle = new Bicycle(req.body);
        await bicycle.save();
        res.status(201).json(bicycle);
    } catch (error) {
        res.status(500).json({ message: 'Error creating bicycle', error: error.message });
    }
});

// Update bicycle (admin only)
router.put('/:id', auth, isAdmin, async (req, res) => {
    try {
        const bicycle = await Bicycle.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!bicycle) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }
        res.json(bicycle);
    } catch (error) {
        res.status(500).json({ message: 'Error updating bicycle', error: error.message });
    }
});

// Delete bicycle (admin only)
router.delete('/:id', auth, isAdmin, async (req, res) => {
    try {
        const bicycle = await Bicycle.findByIdAndDelete(req.params.id);
        if (!bicycle) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }
        res.json({ message: 'Bicycle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting bicycle', error: error.message });
    }
});

module.exports = router; 