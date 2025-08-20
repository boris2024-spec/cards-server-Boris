import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import { connectToDb } from '../DB/dbService.js';

// Integration test: register business user -> login -> create card -> like toggle

describe('Integration: user flow (register -> login -> create card -> like)', () => {
    let token;
    let createdCardId;
    let userId;

    beforeAll(async () => {
        // Use separate test DB
        process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cards_app_test';
        if (mongoose.connection.readyState === 0) {
            await connectToDb();
        }
        // Clean collections
        const collections = Object.keys(mongoose.connection.collections);
        for (const name of collections) {
            await mongoose.connection.collections[name].deleteMany({});
        }
    });

    afterAll(async () => {
        if (mongoose.connection.readyState === 1) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
    });

    test('register business user', async () => {
        const unique = Date.now();
        const res = await request(app)
            .post('/users')
            .send({
                name: { first: 'John', last: 'Doe' },
                phone: '050-123 4567',
                email: `john${unique}@example.com`,
                password: 'SecretPass1',
                isBusiness: true,
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('_id');
        expect(res.body).toHaveProperty('isBusiness', true);
        userId = res.body._id;
    });

    test('login returns token', async () => {
        const email = Object.values(mongoose.connection.collections.users ? await mongoose.connection.collections.users.findOne({}) : {})?.email; // fallback (not used)
        const res = await request(app)
            .post('/users/login')
            .send({ email: (await mongoose.connection.collections.users.findOne({}, { projection: { email: 1 } })).email, password: 'SecretPass1' });
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');
        token = res.body.token;
    });

    test('create card', async () => {
        const res = await request(app)
            .post('/cards')
            .set('x-auth-token', token)
            .send({
                title: 'My Card',
                subtitle: 'Sub',
                description: 'Desc',
                phone: '050-123 4567',
                email: 'contact@example.com',
                web: 'https://example.com',
                image: { url: 'https://example.com/img.png', alt: 'Image' },
                address: { state: '', country: 'IL', city: 'Tel Aviv', street: 'Herzl', houseNumber: 1, zip: 12345 },
                bizNumber: ''
            });
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('data');
        expect(res.body.data).toHaveProperty('_id');
        expect(res.body.data).toHaveProperty('bizNumber');
        createdCardId = res.body.data._id;
    });

    test('like card (toggle on)', async () => {
        const res = await request(app)
            .patch(`/cards/${createdCardId}/like`)
            .set('x-auth-token', token)
            .send();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data.likeCount', 1);
    });

    test('like card again (toggle off)', async () => {
        const res = await request(app)
            .patch(`/cards/${createdCardId}/like`)
            .set('x-auth-token', token)
            .send();
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('data.likeCount', 0);
    });
});
