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

app.get("/login", (req, res) => {

})

app.get("/register", (req, res) => {
    
    const errorMessage = ""
    res.render("register", {errorMessage})
})


// This function registers new users when they submit their username and password in the "register" page.
// If the username is not already registered, it is added along with a hashed password. If it is in use, the user is returned
// to the registry page and handed an error message.
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    const otherUser = await db.getPlayerByUsername(username);

    if (otherUser !== undefined) {
        const errorMessage = "That username is already taken";
        return res.render("register", {errorMessage} );
    }

    console.log(`Username: ${username}`);
    console.log(`Unhashed Password: ${password}`)

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log(`Hashed Password: ${hashedPassword}`);

        const response = await db.registerUser(username, hashedPassword);
        console.log(response);

        res.render("home");
    } catch (error) {
        res.status(500).send('Error hashing password. This is most likely our fault.');
    }
})

server.listen(port, () => {
    console.log("Server running.")
})