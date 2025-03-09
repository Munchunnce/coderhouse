const jwt = require('jsonwebtoken');
const refreshModel = require('../models/refresh-model');
const accessTokenSecret = process.env.JTW_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JTW_REFRESH_TOKEN_SECRET;

class TokenService {
    genrateTokens(payload) {
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1h'
        });

        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            expiresIn: '1y'
        });

        return { accessToken, refreshToken };
    }

    async storeRefreshToke(token, userId) {
        try {
            await refreshModel.create({
                token,
                userId,
            })
        } catch (err) {
            console.log(err.message);
        }
    }

    // Verify Access Token
    async verifyAccessToken(token) {
        return jwt.verify(token, accessTokenSecret);
    }

}

module.exports = new TokenService();