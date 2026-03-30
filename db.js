const Database = require("better-sqlite3");
const bcrypt = require("bcrypt");

//Connect to Database
const db = new Database("data/data.db");



function getDriverByUsername(username) {
    const stmt = db.prepare("SELECT * FROM drivers WHERE username = ?");
    return stmt.get(username);
}

async function checkDriverPassword(inputUsername, inputPassword) {
    const stmt = db.prepare("SELECT password_hash FROM drivers WHERE username = ?")
    const hashedPasswordJSON = stmt.get(inputUsername)
    const hashedPassword = hashedPasswordJSON.password_hash

    const decryptPassword = await bcrypt.compare(inputPassword, hashedPassword)

    if (decryptPassword) {
        return true
    } else {
        return false
    }
}

module.exports = {
    getDriverByUsername,
    checkDriverPassword
}