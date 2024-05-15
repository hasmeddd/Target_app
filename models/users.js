const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    password: {
        type: String,
    },
    email: {
        type: String,
    },
    role: {
        type: Boolean,
        default: false 
    }
});

module.exports = mongoose.model('User', userSchema);
