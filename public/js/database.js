const mysql = require('mysql2/promise');

async function connect() {
    return mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "game_database"
    })
}

async function getPlayerByUsername(username) {
    const connection = await connect();
    try {
        const [rows] = await connection.query('SELECT * FROM players WHERE username = ?', [username]);
        return rows[0];
    } finally {
        await connection.end();
    }
}

async function registerUser(username, hashedPassword) {
    const connection = await connect();

    try {

        response = await connection.execute(`
            INSERT INTO players (username, password_hash)
            VALUES (?, ?)
            `, [username, hashedPassword])

        return response[0]
    } finally {
        await connection.end();
    }
}

module.exports = {
    getPlayerByUsername,
    registerUser
}