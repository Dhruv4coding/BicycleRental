const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Bicycle = require('../models/Bicycle');
const { auth, isAdmin } = require('../middleware/auth');

// Create new booking
router.post('/', auth, async (req, res) => {
    try {
        const { bicycleId, startTime, endTime, duration } = req.body;

        // Check if bicycle exists and is available
        const bicycle = await Bicycle.findById(bicycleId);
        if (!bicycle) {
            return res.status(404).json({ message: 'Bicycle not found' });
        }
        if (bicycle.status !== 'available') {
            return res.status(400).json({ message: 'Bicycle is not available' });
        }

        // Calculate total price
        const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
        const totalPrice = duration === 'hourly'
            ? hours * bicycle.pricePerHour
            : Math.ceil(hours / 24) * bicycle.pricePerDay;

        // Create booking
        const booking = new Booking({
            user: req.user._id,
            bicycle: bicycleId,
            startTime,
            endTime,
            duration,
            totalPrice
        });

        await booking.save();

        // Update bicycle status
        bicycle.status = 'rented';
        await bicycle.save();

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
});

// Get user's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate('bicycle')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// Get all bookings (admin only)
router.get('/', auth, isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('bicycle')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
});

// Update booking status (admin only)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        booking.status = status;
        await booking.save();

        // If booking is completed or cancelled, update bicycle status
        if (status === 'completed' || status === 'cancelled') {
            const bicycle = await Bicycle.findById(booking.bicycle);
            bicycle.status = 'available';
            await bicycle.save();
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error updating booking status', error: error.message });
    }
});

// Cancel booking
router.post('/:id/cancel', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Check if user owns the booking
        if (booking.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to cancel this booking' });
        }

        // Only allow cancellation of pending bookings
        if (booking.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot cancel this booking' });
        }

        booking.status = 'cancelled';
        await booking.save();

        // Update bicycle status
        const bicycle = await Bicycle.findById(booking.bicycle);
        bicycle.status = 'available';
        await bicycle.save();

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: 'Error cancelling booking', error: error.message });
    }
});

module.exports = router; 