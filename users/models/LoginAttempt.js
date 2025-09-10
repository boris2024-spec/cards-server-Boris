import { model, Schema } from "mongoose";

const loginAttemptSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: true
    },
    attempts: {
        type: Number,
        default: 0
    },
    blockedUntil: {
        type: Date,
        default: null
    },
    lastAttempt: {
        type: Date,
        default: Date.now
    }
});

// Автоматическое удаление записей после истечения блокировки
loginAttemptSchema.index({ blockedUntil: 1 }, {
    expireAfterSeconds: 0,
    partialFilterExpression: { blockedUntil: { $exists: true, $ne: null } }
});

const LoginAttempt = model("loginAttempt", loginAttemptSchema);

export default LoginAttempt;
