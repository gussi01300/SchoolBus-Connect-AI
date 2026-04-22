const db = require('../data/db');
const bcrypt = require('bcrypt');

function getStudentByUsername(username) {
  const stmt = db.prepare('SELECT * FROM students WHERE username = ?');
  return stmt.get(username);
}

function getStudentByID(id) {
  return db.prepare('SELECT * FROM students WHERE id = ?').get(id);
}

async function checkStudentPassword(inputPassword, inputUsername) {
  const stmt = db.prepare('SELECT password_hash FROM students WHERE username = ?');
  const hashedPasswordJSON = stmt.get(inputUsername);
  const hashedPassword = hashedPasswordJSON.password_hash;

  const decryptPassword = await bcrypt.compare(inputPassword, hashedPassword);

  if (decryptPassword) {
    return true;
  } else {
    return false;
  }
}

module.exports = {
  getStudentByUsername,
  checkStudentPassword,
  getStudentByID,
};
