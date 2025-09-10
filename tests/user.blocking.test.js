import request from 'supertest';
import app from '../app.js';
import { connectToDb } from '../DB/dbService.js';
import User from '../users/models/User.js';
import LoginAttempt from '../users/models/LoginAttempt.js';
import mongoose from 'mongoose';

describe('User Login Blocking Tests', () => {
    let testUser;
    const testEmail = 'test@blocking.com';
    const correctPassword = 'Test123!';
    const wrongPassword = 'WrongPassword123!';

    beforeAll(async () => {
        await connectToDb();

        // Создаем тестового пользователя
        const userData = {
            name: {
                first: 'Test',
                middle: '',
                last: 'User'
            },
            email: testEmail,
            password: correctPassword,
            phone: '050-1234567',
            image: {
                url: 'https://example.com/image.jpg',
                alt: 'Test image'
            },
            address: {
                state: 'Test State',
                country: 'Test Country',
                city: 'Test City',
                street: 'Test Street',
                houseNumber: 123,
                zip: 12345
            }
        };

        const response = await request(app)
            .post('/users')
            .send(userData);

        testUser = response.body;
    });

    afterAll(async () => {
        // Очистка тестовых данных
        await User.deleteOne({ email: testEmail });
        await LoginAttempt.deleteOne({ email: testEmail });
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        // Очищаем попытки входа перед каждым тестом
        await LoginAttempt.deleteOne({ email: testEmail });
    });

    test('Should allow login with correct credentials', async () => {
        const response = await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: correctPassword
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('Should track failed login attempts', async () => {
        // Первая неудачная попытка
        const response1 = await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: wrongPassword
            });

        expect(response1.status).toBe(401);
        expect(response1.body.message).toContain('2 attempts remaining');

        // Вторая неудачная попытка
        const response2 = await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: wrongPassword
            });

        expect(response2.status).toBe(401);
        expect(response2.body.message).toContain('1 attempts remaining');
    });

    test('Should block user after 3 failed attempts', async () => {
        // Три неудачные попытки
        for (let i = 0; i < 3; i++) {
            await request(app)
                .post('/users/login')
                .send({
                    email: testEmail,
                    password: wrongPassword
                });
        }

        // Четвертая попытка должна быть заблокирована
        const response = await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: correctPassword // Даже с правильным паролем
            });

        expect(response.status).toBe(423);
        expect(response.body.message).toContain('blocked');
    });

    test('Should reset attempts after successful login', async () => {
        // Две неудачные попытки
        await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: wrongPassword
            });

        await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: wrongPassword
            });

        // Успешный вход
        const successResponse = await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: correctPassword
            });

        expect(successResponse.status).toBe(200);

        // Проверяем, что попытки сброшены
        const loginAttempt = await LoginAttempt.findOne({ email: testEmail });
        expect(loginAttempt).toBeNull();
    });

    test('Admin should be able to reset login attempts', async () => {
        // Создаем админа
        const adminData = {
            name: {
                first: 'Admin',
                middle: '',
                last: 'User'
            },
            email: 'admin@test.com',
            password: 'Admin123!',
            phone: '050-7654321',
            adminCode: process.env.ADMIN_REG_CODE,
            image: {
                url: 'https://example.com/admin.jpg',
                alt: 'Admin image'
            },
            address: {
                state: 'Admin State',
                country: 'Admin Country',
                city: 'Admin City',
                street: 'Admin Street',
                houseNumber: 456,
                zip: 54321
            }
        };

        const adminResponse = await request(app)
            .post('/users')
            .send(adminData);

        const adminLoginResponse = await request(app)
            .post('/users/login')
            .send({
                email: 'admin@test.com',
                password: 'Admin123!'
            });

        const adminToken = adminLoginResponse.body.token;

        // Блокируем пользователя
        for (let i = 0; i < 3; i++) {
            await request(app)
                .post('/users/login')
                .send({
                    email: testEmail,
                    password: wrongPassword
                });
        }

        // Админ сбрасывает попытки
        const resetResponse = await request(app)
            .patch('/users/reset-login-attempts')
            .set('x-auth-token', adminToken)
            .send({
                email: testEmail
            });

        expect(resetResponse.status).toBe(200);
        expect(resetResponse.body.message).toContain('reset successfully');

        // Проверяем, что пользователь может войти
        const loginResponse = await request(app)
            .post('/users/login')
            .send({
                email: testEmail,
                password: correctPassword
            });

        expect(loginResponse.status).toBe(200);

        // Очистка
        await User.deleteOne({ email: 'admin@test.com' });
    });
});
