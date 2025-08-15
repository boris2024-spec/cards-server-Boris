import request from 'supertest';
import app from '../app.js';

// Simple ping test to ensure app boots

describe('GET /ping', () => {
    it('should return pong', async () => {
        const res = await request(app).get('/ping');
        expect(res.status).toBe(200);
        expect(res.text).toBe('pong');
    });
});
