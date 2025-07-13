const i18n = require('i18n');
const { logInTestEnv } = require("../../helpers/logger.helper");
let loginAttemptModel = require("./loginAttempt.model")
const BLOCK_TIME_MINUTES = 5;
const MAX_ATTEMPTS = 3;

exports.checkAndTrackloginAttempt = async (ip) => {
    try {
        const now = new Date();

        let attempt = await loginAttemptModel.findOne({ ip });

        if (attempt?.blockedUntil && attempt.blockedUntil > now) {
            return {
                success: false,
                code: 403,
                error: i18n.__("loginBlocked"),
                blocked: true,
                unblockAt: attempt.blockedUntil
            };
        }

        if (!attempt) {
            await loginAttemptModel.create({ ip });
            return {
                success: true,
                code: 200,
            };
        }

        const timeDiff = (now - attempt.lastAttempt) / (1000 * 60);
        if (timeDiff > BLOCK_TIME_MINUTES) {
            attempt.attempts = 1;
        } else {
            attempt.attempts += 1;
        }

        attempt.lastAttempt = now;

        if (attempt.attempts >= MAX_ATTEMPTS) {
            attempt.blockedUntil = new Date(now.getTime() + BLOCK_TIME_MINUTES * 60 * 1000);
        }

        await attempt.save();

        return {
            success: true,
            code: 200,

        };
    } catch (err) {
        logInTestEnv(`err.message`, err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};


exports.checkOnlyLoginBlockStatus = async (ip) => {
    try {
        const now = new Date();
        const attempt = await loginAttemptModel.findOne({ ip });

        if (attempt?.blockedUntil && attempt.blockedUntil > now) {
            return {
                success: false,
                code: 403,
                error: i18n.__("loginBlocked"),
                blocked: true,
                unblockAt: attempt.blockedUntil
            };
        }

        return {
            success: true,
            code: 200,
            blocked: false
        };

    } catch (err) {
        logInTestEnv("checkOnlyLoginBlockStatus error", err.message);
        return {
            success: false,
            code: 500,
            error: i18n.__("internalServerError")
        };
    }
};