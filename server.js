const path = require('path');
const socketIO = require('socket.io');
const port = process.env.PORT || 3000;
const bcrypt = require('bcrypt');


const publicPath = path.join(__dirname, './public');

const http = require('http');
const express = require('express');
let app = express();
let server = http.createServer(app)
let io = socketIO(server);
const db = require(path.join(publicPath, "/js/database.js"));

app.use(express.static(publicPath));
app.use(express.urlencoded({extended: true}))

const { engine } = require('express-handlebars');
const { error } = require('console');
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", "./views");



app.get("/", async (req, res) => {

    res.render("start")
})

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    console.log(username)
    console.log(password)
    
    const userRow = await db.getPlayerByUsername(username);

    if (userRow === undefined) {
        res.render("start", {errorMessage: "That user does not exist"})
    } else if (await bcrypt.compare(password, userRow.password_hash)) {

        res.cookie('username', username, { httpOnly: true, secure: true, maxAge: 3600000 }); // 1 hour
        res.render("home")

    } else {
        res.render("start", {errorMessage: "Incorrect password, try again"})
    }
})

app.get("/register", (req, res) => {  
    res.render("register")
})
// This function registers new users when they submit their username and password in the "register" page.
// If the username is not already registered, it is added along with a hashed password. If it is in use, the user is returned
// to the registry page and handed an error message.
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const otherUser = await db.getPlayerByUsername(username);

    if (otherUser !== undefined) {
        return res.render("register", {errorMessage: "That username is already taken"});
    }

    console.log(`---- New user registered:
Username: ${username}
Unhashed Password: ${password}`)

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log(`Hashed Password: ${hashedPassword}`);

        db.registerUser(username, hashedPassword);

        res.render("home");
    } catch (error) {
        res.status(500).send('Error hashing password. This is most likely our fault.');
    }
})


io.on('connection', (socket) => {
    console.log('New user connected');

    // Example of sending a message to the client
    socket.emit('message', 'Welcome to the home page!');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});



server.listen(port, () => {
    console.log("Server running.")
})