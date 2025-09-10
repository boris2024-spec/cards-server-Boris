
import bcrypt from 'bcryptjs';
import User from './users/models/User.js';
import Card from './cards/models/Card.js';
import { users, cards } from './data/data.js';
import { connectToDb } from "./DB/dbService.js";

const seedAll = async () => {
    try {
        await connectToDb();
        console.log('MongoDB connected');

        // Seed users
        await User.deleteMany({});
        const hashedUsers = await Promise.all(
            users.map(async (user) => {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                return { ...user, password: hashedPassword };
            })
        );
        await User.insertMany(hashedUsers);
        console.log('Users seeded');

        // Seed cards
        await Card.deleteMany({});
        await Card.insertMany(cards);
        console.log('Cards seeded');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        process.exit();
    }
};

seedAll();
// To run this script, use the command: node seed.js