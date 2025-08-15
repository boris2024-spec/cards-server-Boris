import Card from "../models/Card.js";

// Generate a unique 7-digit biz number. Retry limited times to avoid infinite loop.
export const generateBizNumber = async () => {
    const MAX_RETRIES = 5;
    for (let i = 0; i < MAX_RETRIES; i++) {
        const candidate = Math.floor(1000000 + Math.random() * 9000000); // 7 digits
        // check uniqueness
        const existing = await Card.findOne({ bizNumber: candidate });
        if (!existing) return candidate;
    }
    throw new Error("Failed to generate unique biz number after retries");
};
