const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('User', userSchema);
