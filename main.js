// imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
app.use(express.json());


const PORT = process.env.PORT || 4000

// database connection
mongoose.connect(process.env.DB_URI, 
{ 
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("Connected to the database!"));
    
// milddlewares
app.use(express.urlencoded({extended: false}));


app.use(session({
    secret: '123',
    saveUninitialized: true,
    resave: false
}));

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})
app.use(express.static('public'));
// set template engine
app.set("view engine", "ejs");

// router prefix
app.use("", require('./routes/routes'))


app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
})

