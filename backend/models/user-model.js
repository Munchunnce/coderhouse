const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    phone: { type: String, require: true },
    name: { type: String, require: false },
    avatar: { type: String, require: false, get: (avatar) => {
        if(avatar){
            return `${process.env.BASE_URL}${avatar}`;
        }
        return avatar;
    } },
    activated: { type: Boolean, require: false, default: false }
}, {
    timestamps: true,
    toJSON: { getters: true },
});

module.exports = mongoose.model('User', userSchema, 'users');