const mongoose = require('mongoose');
require('dotenv').config();

const initDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/userprofiles', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
    }

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);
    if (!collectionNames.includes('users')) {
        console.log('Creating users collection...');
        await db.createCollection('users');
        console.log('Users collection created');
    } else {
        console.log('Users collection already exists');
    }
};
initDatabase();