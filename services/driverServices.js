const db = require("../data/db")
const bcrypt = require("bcrypt");



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
