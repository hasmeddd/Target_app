const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: String,
    start: Date,
    end: Date,
    details: String,
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Sử dụng kiểu ObjectId để tham chiếu đến ID của người dùng
        ref: 'User'
    }
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event; 