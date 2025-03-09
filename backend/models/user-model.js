const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    phone: { type: String, require: true },
    name: { type: String, require: false },
    avatar: { type: String, require: false },
    activated: { type: Boolean, require: false, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema, 'users');