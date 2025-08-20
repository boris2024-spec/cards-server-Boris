import request from 'supertest';
import app from '../app.js';
import mongoose from 'mongoose';

// Тест проверяет, что можно использовать Authorization: Bearer <token>

describe('Auth header variants', () => {
    let createdUser;
    let token;

    beforeAll(async () => {
        // Регистрируем первого пользователя (станет админом)
        const res = await request(app)
            .post('/users')
            .send({ email: 'authheader@example.com', password: 'Secret123!', name: { first: 'Auth', last: 'Header' } });
        createdUser = res.body;

        const loginRes = await request(app)
            .post('/users/login')
            .send({ email: 'authheader@example.com', password: 'Secret123!' });
        token = loginRes.text.replace(/"/g, ''); // в случае если вернётся в кавычках
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should allow access with Authorization Bearer token', async () => {
        const res = await request(app)
            .get(`/users/${createdUser._id}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.email).toBe('authheader@example.com');
    });

    it('should still allow access with x-auth-token header', async () => {
        const res = await request(app)
            .get(`/users/${createdUser._id}`)
            .set('x-auth-token', token);

        expect(res.status).toBe(200);
    });
});
