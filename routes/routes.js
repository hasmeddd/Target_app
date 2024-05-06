const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Event = require('../models/events');
const multer = require('multer');
const fs = require('fs');


router.get("/", async (req, res) => {
    try {
        
        const events = await Event.find().exec();
        res.render('index', { title: "Home page", events: events });
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send("Lỗi máy chủ nội bộ");
    }
});

router.get("/events", async (req, res) => {
    try {
        const userId = '66326c7ffc91432c086f4486'; // thay bằng const userId = req.user.id; khi làm đăng nhập là xong
        const events = await Event.find({ userId }).exec();
        res.json(events);
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
    }
});


router.post('/addEvent', async(req,res) => {
    try {
        const userId = '66326c7ffc91432c086f4486'; // thay bằng const userId = req.user.id; khi làm đăng nhập là xong
        const eventData = req.body;
        const newEvent = new Event({
            title:eventData.title,
            start:eventData.start,
            end:eventData.end,
            details:eventData.details,
            userId:userId,
        });
        // Lưu sự kiện mới vào cơ sở dữ liệu
        await newEvent.save();
        res.status(201).send('Sự kiện đã được tạo thành công');
    } catch (error) {
        console.error("Lỗi khi tạo sự kiện:", error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }
});


// Cập nhật sự kiện route
router.post('/update/:id', async (req, res) => {
    try {
        const eventId = req.params.id; // Lấy id của sự kiện cần cập nhật từ URL
        const eventData = req.body;
        const userId = '66326c7ffc91432c086f4486'; 
        // Cập nhật thông tin sự kiện trong cơ sở dữ liệu
        await Event.findByIdAndUpdate(eventId, {
            title: eventData.title,
            start: eventData.start,
            end: eventData.end,
            details: eventData.details,
            userId: userId
        })
        res.status(200).send('Event deleted successfully');
    }
    catch (error) {
        console.error("Lỗi cập nhật sự kiện:", error);
        res.status(500).send('Lỗi máy chủ nội bộ');
    }        
});

router.post('/delete/:id', async (req, res) => {
    try {
        const eventId = req.params.id; // Lấy id của sự kiện cần xóa từ URL
        await Event.findByIdAndDelete(eventId); // Xóa sự kiện từ cơ sở dữ liệu
        res.status(200).send('Event deleted successfully');
    } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).send('Internal server error');
    }
});
module.exports = router;