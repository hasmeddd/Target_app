const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Event = require('../models/events');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Route hiển thị danh sách người dùng
router.get("/users", async (req, res) => {
    try {
      const users = await User.find();
      res.render("users", { users }); // Render template "users" với danh sách người dùng
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).send("Internal server error");
    }
  });
  
  module.exports = router;

// Route hiển thị trang đăng nhập
router.get("/login", (req, res) => {
    const user = req.session.user;
    res.render("login", { title: "Đăng nhập", user: user});
});
router.get("/signup", (req,res) =>{
    const user = req.session.user;
    res.render("signup", { title: "Đăng ký", user: user });
});


//register User
router.post("/signup", async (req, res) => {
    const user = req.session.user;
    const { username, password, email } = req.body;
    
    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    if (!username || !password || !email) {
      return res.status(400).send("Username and password are required");
    }
  
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            req.session.message = { type: 'danger', message: "Tên người dùng hoặc email đã tồn tại" };
            return res.render("signup", { title: "Đăng ký", user: user, message: req.session.message });
        }
        // Tạo hash từ mật khẩu người dùng
        const hashedPassword = await bcrypt.hash(password, 10);

    
        // Tạo một người dùng mới với mật khẩu đã được hash
        const newUser = new User({ username, password: hashedPassword, email });
    
        // Lưu người dùng vào cơ sở dữ liệu
        const savedUser = await newUser.save();
        
        // Ẩn thông tin nhạy cảm và chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
        req.session.message = { type: 'success', message: "Đăng ký tài khoản thành công" };
        res.render("login", {title: "Đăng nhập", user: user, message: req.session.message });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Route hiển thị trang chủ
router.get("/", async (req, res) => {
    try {
        const message = req.session.message; // Lấy thông báo từ session
        req.session.message = null; // Xóa thông báo từ session sau khi sử dụng

        const user = req.session.user;
        // Kiểm tra xem người dùng đã đăng nhập hay chưa
        if (!req.session.user) {
            // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
            return res.redirect("/login");
        }

        // Lấy danh sách sự kiện từ người dùng hiện tại hoặc từ cơ sở dữ liệu
        const userId = req.session.user._id;
        // console.log(userId)
        // Thực hiện truy vấn để lấy danh sách sự kiện của người dùng
        const events = await Event.find({ userId }).exec();

        // Render trang chủ với danh sách sự kiện
        if (message && typeof message === 'object') {
            res.render('index', { title: "Calendar App", events: events, user: user, message });
        } else {
            res.render('index', { title: "Calendar App", events: events, user: user });
        }
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send("Internal server error");
    }
});

// Route xử lý đăng nhập
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        
        // console.log(user)
        // console.log(username, password)
        
        if (!user) {
            req.session.message = {
                type: 'danger',
                message: 'User không tồn tại'
            };
            return res.render("login", { message: req.session.message, title: "Login", user });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (isPasswordMatch) {
            // Lưu thông tin người dùng vào session
            req.session.user = user;
            req.session.message = {
                type: 'success',
                message: 'Đăng nhập thành công'
            };
            // console.log(user);
            return res.redirect("/"); // Chuyển hướng đến trang chủ sau khi đăng nhập thành công
        } else {
            req.session.message = {
                type: 'danger',
                message: 'Sai mật khẩu'
            };
            return res.render("login", { message: req.session.message, title: "Login", user });
        }
    } catch (error) {
        console.error("Error logging in:", error);
        return res.render("login", { error: "Internal server error", title: "Login" });
    }
});
// Assuming you have Express.js setup
router.get("/logout", (req, res) => {
    // Destroy the user session
    req.session.destroy((err) => {
        if (err) {
            console.log("Error logging out:", err);
            return res.status(500).send("Internal Server Error");
        }
        // Redirect the user to the home page or any other desired destination after logout
        res.redirect("/");
    });
});

router.get("/events", async (req, res) => {
    try {
        const userId = req.session.user._id;  // Thay bằng const userId = req.user.id; khi đã thực hiện xác thực người dùng
        const events = await Event.find({ userId, status: false  }).exec(); // Lấy danh sách sự kiện của một người dùng cụ thể
        res.json(events); // Trả về danh sách sự kiện dưới dạng JSON
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ" }); // Trả về mã lỗi 500 nếu có lỗi xảy ra
    }
});

router.get("/events/date", async (req, res) => {
    try {
        const startDate = req.query.start; // Lấy ngày bắt đầu từ tham số trên URL
        const endDate = req.query.end; // Lấy ngày kết thúc từ tham số trên URL
        const userId = req.session.user._id; // Thay bằng const userId = req.user.id; khi đã thực hiện xác thực người dùng
        // Thực hiện truy vấn cơ sở dữ liệu để lấy danh sách sự kiện trong khoảng thời gian được yêu cầu
        const events = await Event.find({ userId, start: { $gte: startDate }, end: { $lte: endDate } , status: false  }).exec();
        res.json(events); // Trả về danh sách sự kiện dưới dạng JSON
    } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).json({ error: "Lỗi máy chủ nội bộ" }); // Trả về mã lỗi 500 nếu có lỗi xảy ra
    }
});


router.post('/addEvent', async(req,res) => {
    try {
        const userId = req.session.user._id; // thay bằng const userId = req.user.id; khi làm đăng nhập là xong
        const eventData = req.body;
        const newEvent = new Event({
            title:eventData.title,
            start:eventData.start,
            end:eventData.end,
            details:eventData.details,
            status: eventData.status, // Thêm status
            more: eventData.more,
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
        const userId = req.session.user._id; // thay bằng const userId = req.user.id; khi làm đăng nhập là xong
        // Cập nhật thông tin sự kiện trong cơ sở dữ liệu
        await Event.findByIdAndUpdate(eventId, {
            title: eventData.title,
            start: eventData.start,
            end: eventData.end,
            details: eventData.details,
            status: eventData.status, // Thêm status
            more: eventData.more,
            userId: userId
        })
        res.status(200).send('Sự kiện đã cập nhật thành công');
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

router.get("/report", (req, res) => {
    const user = req.session.user;
    res.render("report", { title: "Thống kê", user: user});
});
module.exports = router;