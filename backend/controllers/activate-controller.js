const Jimp = require('jimp');
const path = require('path');
const userServices = require('../services/user-service');
const UserDto = require('../dtos/user-dto');


class ActivateController {
    async activate(req, res){
        // Activation Logic
        const { name, avatar } = req.body;
        if(!name || !avatar){
            return res.status(400).json({ message: 'All fields are required!' });
        }

        // Image Base64
        const buffer = Buffer.from(
            avatar.replace(/^data:image\/\w+;base64,/, ''),
            'base64'
        );
        console.log("Buffer Data:", buffer);


        const imagePath = `${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

        try {
            const jimResp = await Jimp.read(buffer);
            console.log("Jimp Response:", jimResp);
            jimResp.resize(150, Jimp.AUTO).writeAsync(path.resolve(__dirname, `../storage/${imagePath}`));
        } catch (err) {
            console.log('Error processing the image:', err);
            return res.status(500).json({ message: 'Could not process the image' });
        }

        const userId = req.user._id;
        // Save the image path to the user update
        try {
            const user = await userServices.findUser({ _id: userId });
            console.log("User ID from token:", req.user);

            if(!user){
                return res.status(404).json({ message: 'User not found' });
            }
            user.activated = true;
            user.name = name;
            user.avatar = `/storage/${imagePath}`;
            await user.save();
            return res.json({ user: new UserDto(user), auth: true });
        } catch (err) {
            console.log('Error finding user:', err);
            return res.status(500).json({ message: 'Could not find the user' });
        }    
    }
}

module.exports = new ActivateController();