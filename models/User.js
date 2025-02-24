const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    sid: { type: String, required: true },
    name: { type: String, required: true },
    username: { type: String, required: true , unique:true},
    twitterId: { type: String, required: true },
    publicKey: { type: String, required:true },
    privateKey: { type: String, required:true }
});

module.exports = mongoose.model('User', UserSchema);
