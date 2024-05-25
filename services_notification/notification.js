// notification.js

const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Event = require('../models/events');
const User = require('../models/users');

// Nodemailer transporter configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

// Hàm gửi email thông báo
async function sendEmailNotification(userEmail, eventTitle) {
    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: userEmail,
        subject: 'Thông báo về công việc',
        text: `Bạn cần hoàn thành công việc "${eventTitle}" trước hạn.`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Hàm kiểm tra và gửi thông báo
async function checkAndSendNotification() {
    try {
        const currentDate = new Date();
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const events = await Event.find({ end: { $lte: tomorrow }, status: false }).exec();
        
        for (let event of events) {
            const user = await User.findById(event.userId).exec();
            if (user && user.email) {
                sendEmailNotification(user.email, event.title);
            }
        }
    } catch (error) {
        console.error("Error checking and sending notifications:", error);
    }
}


module.exports = { checkAndSendNotification };
