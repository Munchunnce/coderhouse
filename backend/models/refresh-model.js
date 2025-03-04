const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const refreshSchema = new Schema({
    token: { type: String, require: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User'},
}, {
    timestamps: true
});

module.exports = mongoose.model('Refresh', refreshSchema, 'tokens');