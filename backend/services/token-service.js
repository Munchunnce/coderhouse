const jwt = require('jsonwebtoken');
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

}

module.exports = new TokenService();