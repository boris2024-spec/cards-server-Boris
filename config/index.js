// Centralized configuration loader
import 'dotenv/config';

const env = process.env;

export const config = {
    env: env.NODE_ENV || 'development',
    port: Number(env.PORT) || 3000,
    mongodb: {
        uri: env.MONGODB_URI || 'mongodb://127.0.0.1:27017/business_card_app',
    },
    jwt: {
        secret: env.JWT_SECRET || 'dev_jwt_secret_change_me',
        expiresIn: env.JWT_EXPIRES || '1h',
    },
    bizNumber: {
        maxRetries: Number(env.BIZNUM_MAX_RETRIES) || 5,
    },
    rateLimit: {
        windowMs: Number(env.RL_WINDOW_MS) || 15 * 60 * 1000,
        max: Number(env.RL_MAX) || 100,
    }
};

export default config;
