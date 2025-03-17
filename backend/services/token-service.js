const jwt = require('jsonwebtoken');
const refreshModel = require('../models/refresh-model');
const accessTokenSecret = process.env.JTW_ACCESS_TOKEN_SECRET;
const refreshTokenSecret = process.env.JTW_REFRESH_TOKEN_SECRET;

class TokenService {
    genrateTokens(payload) {
        const accessToken = jwt.sign(payload, accessTokenSecret, {
            expiresIn: '1m'
        });

        const refreshToken = jwt.sign(payload, refreshTokenSecret, {
            expiresIn: '1y'
        });

        return { accessToken, refreshToken };
    }

    async storeRefreshToken(token, userId) {
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

    // verify Refresh Token
    async verifyRefreshToken(refreshToken) {
        return jwt.verify(refreshToken, refreshTokenSecret);
    }

    // find refresh token
    async findRefreshToken(userId,refreshToken) {
        return await refreshModel.findOne({userId: userId, token: refreshToken });
    }
    
    // update refresh token
    async updateRefreshToken(userId, refreshToken) {
        return await refreshModel.updateOne({userId: userId}, { token: refreshToken });
    }


}

module.exports = new TokenService();