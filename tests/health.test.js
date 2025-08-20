import request from 'supertest';
import app from '../app.js';

describe('GET /health', () => {
    it('should return ok status structure', async () => {
        const res = await request(app).get('/health');
        expect([200, 503]).toContain(res.status);
        expect(res.body).toHaveProperty('status');
        expect(res.body).toHaveProperty('uptime');
        expect(res.body).toHaveProperty('db');
    });
});
