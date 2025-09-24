// Script to clear the database
import mongoose from 'mongoose';
import { connectToDb } from './DB/dbService.js';

async function clearDatabase() {
    try {
        console.log('Connecting to the database...');
        await connectToDb();

        console.log('Clearing collections...');
        const collections = Object.keys(mongoose.connection.collections);

        for (const collectionName of collections) {
            const collection = mongoose.connection.collections[collectionName];
            await collection.deleteMany({});
            console.log(`Collection ${collectionName} cleared`);
        }

        console.log('✅ Database cleared successfully');
        await mongoose.connection.close();

    } catch (error) {
        console.error('❌ Error while clearing the database:', error);
        process.exit(1);
    }
}

clearDatabase();
