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

function signOutStudent(studentId, untilDate = null) {
  const stmt = db.prepare(`
    UPDATE students
    SET signed_out = 1, signed_out_until = ?
    WHERE id = ?
  `);
  return stmt.run(untilDate, studentId);
}

function reactivateStudentIfExpired(studentId) {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (student && student.signed_out_until) {
    const today = new Date().toISOString().split('T')[0];
    if (student.signed_out_until < today) {
      db.prepare('UPDATE students SET signed_out = 0, signed_out_until = NULL WHERE id = ?')
        .run(studentId);
    }
  }
}

function isStudentSignedOut(studentId) {
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId);
  if (!student || !student.signed_out) return false;

  if (student.signed_out_until) {
    const today = new Date().toISOString().split('T')[0];
    if (student.signed_out_until < today) {
      db.prepare('UPDATE students SET signed_out = 0, signed_out_until = NULL WHERE id = ?')
        .run(studentId);
      return false;
    }
  }
  return true;
}

module.exports = {
  getStudentByUsername,
  checkStudentPassword,
  getStudentByID,
  signOutStudent,
  reactivateStudentIfExpired,
  isStudentSignedOut,
};
