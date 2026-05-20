const db = require('../data/db');
const bcrypt = require('bcrypt');

function getDriverByUsername(username) {
  const stmt = db.prepare('SELECT * FROM drivers WHERE username = ?');
  return stmt.get(username);
}

async function checkDriverPassword(inputUsername, inputPassword) {
  const stmt = db.prepare('SELECT password_hash FROM drivers WHERE username = ?');
  const hashedPasswordJSON = stmt.get(inputUsername);
  const hashedPassword = hashedPasswordJSON.password_hash;

  const decryptPassword = await bcrypt.compare(inputPassword, hashedPassword);

  if (decryptPassword) {
    return true;
  } else {
    return false;
  }
}

function newLocation(driverUsername, latitude, longitude, source = 'geolocation') {
  const driver = getDriverByUsername(driverUsername);
  if (!driver) return null;

  const busStmt = db.prepare('SELECT * FROM buses WHERE driver_id = ?');
  const bus = busStmt.get(driver.id);
  if (!bus) return null;

  const insertStmt = db.prepare(`
    INSERT INTO bus_locations (bus_id, latitude, longitude, source)
    VALUES (?, ?, ?, ?)
  `);
  return insertStmt.run(bus.id, latitude, longitude, source);
}

function calcNextStop(driverUsername) {
  const driver = getDriverByUsername(driverUsername);
  if (!driver) return null;

  const busStmt = db.prepare('SELECT * FROM buses WHERE driver_id = ?');
  const bus = busStmt.get(driver.id);
  if (!bus) return null;

  const progressStmt = db.prepare('SELECT current_stop_index FROM bus_progress WHERE bus_id = ?');
  const progress = progressStmt.get(bus.id);
  if (!progress) return null;

  const nextIndex = progress.current_stop_index + 1;

  const stopStmt = db.prepare(`
    SELECT s.* FROM stops s
    JOIN bus_stops bs ON s.id = bs.stop_id
    WHERE bs.bus_id = ? AND bs.stop_index = ?
  `);
  return stopStmt.get(bus.id, nextIndex);
}

function markAllStudentsAtStopPickedUp(stopId, busId) {
  const today = new Date().toISOString().split('T')[0];
  const insertStmt = db.prepare(`
    INSERT OR IGNORE INTO students_picked_up (student_id, stop_id, bus_id, date_text)
    SELECT id, stop_id, bus_id, ? FROM students WHERE stop_id = ? AND bus_id = ?
  `);
  return insertStmt.run(today, stopId, busId).changes;
}

function getStudentsAtStop(stopId, busId) {
  const stmt = db.prepare(`
    SELECT s.* FROM students s
    LEFT JOIN students_picked_up spu ON s.id = spu.student_id AND spu.date_text = ?
    WHERE s.stop_id = ? AND s.bus_id = ? AND spu.id IS NULL
  `);
  const today = new Date().toISOString().split('T')[0];
  return stmt.all(today, stopId, busId);
}

function getBusByDriverId(driverId) {
  const stmt = db.prepare('SELECT * FROM buses WHERE driver_id = ?');
  return stmt.get(driverId);
}

module.exports = {
  getDriverByUsername,
  checkDriverPassword,
  newLocation,
  calcNextStop,
  markAllStudentsAtStopPickedUp,
  getStudentsAtStop,
  getBusByDriverId,
};
