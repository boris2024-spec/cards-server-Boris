import LoginAttempt from "../models/LoginAttempt.js";

const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const checkLoginAttempts = async (email) => {
    const loginAttempt = await LoginAttempt.findOne({ email });

    // Check if user is blocked
    if (loginAttempt && loginAttempt.blockedUntil && loginAttempt.blockedUntil > new Date()) {
        const timeLeft = Math.ceil((loginAttempt.blockedUntil - new Date()) / (1000 * 60 * 60));
        return {
            isBlocked: true,
            timeLeft,
            blockedUntil: loginAttempt.blockedUntil
        };
    }

    return {
        isBlocked: false,
        attempts: loginAttempt?.attempts || 0
    };
};

export const handleFailedLogin = async (email) => {
    let loginAttempt = await LoginAttempt.findOne({ email });

    if (!loginAttempt) {
        loginAttempt = new LoginAttempt({
            email,
            attempts: 1,
            lastAttempt: new Date()
        });
    } else {
        loginAttempt.attempts += 1;
        loginAttempt.lastAttempt = new Date();
    }

    // Block after reaching the maximum number of attempts
    if (loginAttempt.attempts >= MAX_ATTEMPTS) {
        loginAttempt.blockedUntil = new Date(Date.now() + BLOCK_DURATION);
    }

    await loginAttempt.save();

    return {
        attempts: loginAttempt.attempts,
        isBlocked: loginAttempt.attempts >= MAX_ATTEMPTS,
        blockedUntil: loginAttempt.blockedUntil,
        remainingAttempts: Math.max(0, MAX_ATTEMPTS - loginAttempt.attempts)
    };
};

export const handleSuccessfulLogin = async (email) => {
    // Remove login attempt record on successful login
    await LoginAttempt.deleteOne({ email });
};

export const resetLoginAttempts = async (email) => {
    // For administrative reset of attempts
    await LoginAttempt.deleteOne({ email });
};
