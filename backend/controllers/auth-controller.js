const otpService = require('../services/otp-service');
const hashService = require('../services/hash-service');
const userService = require('../services/user-service');
const tokenService = require('../services/token-service');
const UserDto = require('../dtos/user-dto');



class AuthController {
    async sendOtp(req, res) {
        const { phone } = req.body;  // yaha se mera phone number mil jayega
        if(!phone){
            res.status(400).json({ message: 'Phone field is required!' });
        }

        const otp = await otpService.genrateOtp();

        // Hash OTP
        const ttl = 1000 * 60 * 2;
        const expires = Date.now() + ttl;
        const data = `${phone}.${otp}.${expires}`;
        const hash = hashService.hashOtp(data);

        // Send OTP
        try{
            // await otpService.sendbySms( phone, otp ); baad mai comment krna hai ok
            res.json({
                hash: `${hash}.${expires}`,
                phone,
                otp,
            })
        } catch(err){
            console.log(err);
            res.status(500).json({message: 'Otp sending failed Please checked!'});
        }
        // res.json({ hash: hash });
    }

    // Verify OTP
    async verifyOtp(req, res) {
        const { otp, hash, phone } = req.body;
        if(!otp || !hash || !phone){
            res.status(400).json({ message: 'All Field are require!' });
        }

        const [hashedOtp, expires] = hash.split('.');
        if(Date.now() > +expires){
            res.status(400).json({ message: 'OTP Expried'});
        }

        const data = `${phone}.${otp}.${expires}`;
        const isValid = await otpService.verifyOtp(hashedOtp, data);

        if(!isValid){
            res.status(400).json({ message: 'Invalid OTP' });
        }

        let user;

        try{
            user = await userService.findUser({ phone });
            if(!user){
                user = await userService.createUser({ phone });
            }
        } catch(err) {
            console.log('line number 64 ', err);
            res.status(500).json({ message: 'user Db Error hai' })
        }

        // Token Service:
        const {accessToken, refreshToken } = tokenService.genrateTokens({ _id: user._id, activated: false });

        await tokenService.storeRefreshToken(refreshToken, user.id);
        // cookies store
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true });
        
    }

    // refreshTokens
    async refresh(req, res) {
        // get refresh token from cookie
        const { refreshToken: refreshTokenFromCookie } = req.cookies;
        // check if refresh token is valid
        let userData;
        try{
            userData = await tokenService.verifyRefreshToken(refreshTokenFromCookie);
            if(!userData){
                return res.status(401).json({ message: 'Invalid Token' });
            }
        } catch(err){
            return res.status(401).json({ message: 'Invalid Token' });
        }

        // check if token is in DB
        try {
            const token = await tokenService.findRefreshToken(userData._id, refreshTokenFromCookie);
            if(!token){
                return res.status(401).json({ message: 'Invalid Token'});
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal Error Db'});
        }

        // check if valid user
        const user = await userService.findUser({ _id: userData._id });
        if(!user){
            return res.status(401).json({ message: 'Invalid User' });
        }

        // generate new tokens
        const {refreshToken ,accessToken} = tokenService.genrateTokens({ _id: userData._id, });

        // update refresh token
        try{
            await tokenService.updateRefreshToken(userData._id, refreshToken);
        } catch(err){
            return res.status(500).json({ message: 'Internal Error Db'});
        }

        // put in cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true
        });

        // response
        const userDto = new UserDto(user);
        res.json({ user: userDto, auth: true });

    }

    // logout
    async logout(req, res) {
        const { refreshToken } = req.cookies;
        // delete refresh token from db
        await tokenService.removeToken(refreshToken);
        // delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({ user: null, auth: false });
    }



}

module.exports = new AuthController();