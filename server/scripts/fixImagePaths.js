const mongoose = require('mongoose');
const Bicycle = require('../models/Bicycle');
require('dotenv').config();

async function fixImagePaths() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bicycle-rental');
        console.log('Connected to MongoDB');

        const bicycles = await Bicycle.find({ image: { $exists: true, $ne: null } });
        console.log(`Found ${bicycles.length} bicycles with images`);

        for (const bicycle of bicycles) {
            const oldImagePath = bicycle.image;
            // Ensure the path starts with /uploads/
            let newImagePath = oldImagePath;
            if (!oldImagePath.startsWith('/uploads/')) {
                newImagePath = `/uploads/${oldImagePath.split('/').pop()}`;
            }

            if (oldImagePath !== newImagePath) {
                await Bicycle.updateOne(
                    { _id: bicycle._id },
                    { $set: { image: newImagePath } }
                );
                console.log(`Updated image path for bicycle ${bicycle._id}`);
                console.log(`Old path: ${oldImagePath}`);
                console.log(`New path: ${newImagePath}`);
            }
        }

        console.log('Finished updating image paths');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixImagePaths(); 