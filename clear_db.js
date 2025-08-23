// Скрипт для очистки базы данных
import mongoose from 'mongoose';
import { connectToDb } from './DB/dbService.js';

async function clearDatabase() {
    try {
        console.log('Подключение к базе данных...');
        await connectToDb();

        console.log('Очистка коллекций...');
        const collections = Object.keys(mongoose.connection.collections);

        for (const collectionName of collections) {
            const collection = mongoose.connection.collections[collectionName];
            await collection.deleteMany({});
            console.log(`Коллекция ${collectionName} очищена`);
        }

        console.log('✅ База данных очищена успешно');
        await mongoose.connection.close();

    } catch (error) {
        console.error('❌ Ошибка при очистке базы данных:', error);
        process.exit(1);
    }
}

clearDatabase();
