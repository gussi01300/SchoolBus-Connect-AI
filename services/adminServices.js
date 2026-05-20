const db = require('../data/db');
const bcrypt = require('bcrypt');

// Buses
function getAllBuses() {
  return db.prepare('SELECT * FROM buses ORDER BY bus_number').all();
}

function getBusById(id) {
  return db.prepare('SELECT * FROM buses WHERE id = ?').get(id);
}

function createBus(busNumber, driverId = null) {
  const stmt = db.prepare('INSERT INTO buses (bus_number, driver_id) VALUES (?, ?)');
  return stmt.run(busNumber, driverId);
}

function updateBus(id, busNumber, driverId) {
  const stmt = db.prepare('UPDATE buses SET bus_number = ?, driver_id = ? WHERE id = ?');
  return stmt.run(busNumber, driverId, id);
}

function deleteBus(id) {
  return db.prepare('DELETE FROM buses WHERE id = ?').run(id);
}

// Stops
function getAllStops() {
  return db.prepare('SELECT * FROM stops ORDER BY stop_name').all();
}

function getStopById(id) {
  return db.prepare('SELECT * FROM stops WHERE id = ?').get(id);
}

function createStop(stopName, address, latitude, longitude) {
  const stmt = db.prepare('INSERT INTO stops (stop_name, address, latitude, longitude) VALUES (?, ?, ?, ?)');
  return stmt.run(stopName, address, latitude, longitude);
}

function updateStop(id, stopName, address, latitude, longitude) {
  const stmt = db.prepare('UPDATE stops SET stop_name = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?');
  return stmt.run(stopName, address, latitude, longitude, id);
}

function deleteStop(id) {
  return db.prepare('DELETE FROM stops WHERE id = ?').run(id);
}

// Bus Routes (bus_stops)
function getBusRoute(busId) {
  return db.prepare(`
    SELECT bs.*, s.stop_name, s.address, s.latitude, s.longitude
    FROM bus_stops bs
    JOIN stops s ON bs.stop_id = s.id
    WHERE bs.bus_id = ?
    ORDER BY bs.stop_index
  `).all(busId);
}

function setBusRoute(busId, stopIds) {
  const deleteStmt = db.prepare('DELETE FROM bus_stops WHERE bus_id = ?');
  const insertStmt = db.prepare('INSERT INTO bus_stops (bus_id, stop_id, stop_index) VALUES (?, ?, ?)');

  const transaction = db.transaction(() => {
    deleteStmt.run(busId);
    stopIds.forEach((stopId, index) => {
      insertStmt.run(busId, stopId, index);
    });
  });

  return transaction();
}

function addStopToRoute(busId, stopId, stopIndex) {
  const stmt = db.prepare('INSERT INTO bus_stops (bus_id, stop_id, stop_index) VALUES (?, ?, ?)');
  return stmt.run(busId, stopId, stopIndex);
}

function removeStopFromRoute(busId, stopId) {
  return db.prepare('DELETE FROM bus_stops WHERE bus_id = ? AND stop_id = ?').run(busId, stopId);
}

// Students
function getAllStudents() {
  return db.prepare(`
    SELECT s.*, b.bus_number, st.stop_name, st.address as stop_address
    FROM students s
    JOIN buses b ON s.bus_id = b.id
    JOIN stops st ON s.stop_id = st.id
    ORDER BY s.full_name
  `).all();
}

function getStudentById(id) {
  return db.prepare('SELECT * FROM students WHERE id = ?').get(id);
}

function createStudent(username, passwordHash, fullName, busId, stopId) {
  const stmt = db.prepare('INSERT INTO students (username, password_hash, full_name, bus_id, stop_id) VALUES (?, ?, ?, ?, ?)');
  return stmt.run(username, passwordHash, fullName, busId, stopId);
}

function updateStudent(id, fullName, busId, stopId, signedOut) {
  const stmt = db.prepare('UPDATE students SET full_name = ?, bus_id = ?, stop_id = ?, signed_out = ? WHERE id = ?');
  return stmt.run(fullName, busId, stopId, signedOut ? 1 : 0, id);
}

function deleteStudent(id) {
  return db.prepare('DELETE FROM students WHERE id = ?').run(id);
}

function resetStudentPassword(id, newPassword) {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  return db.prepare('UPDATE students SET password_hash = ? WHERE id = ?').run(hashedPassword, id);
}

// Drivers
function getAllDrivers() {
  return db.prepare('SELECT * FROM drivers ORDER BY full_name').all();
}

function getDriverById(id) {
  return db.prepare('SELECT * FROM drivers WHERE id = ?').get(id);
}

function createDriver(username, passwordHash, fullName) {
  const stmt = db.prepare('INSERT INTO drivers (username, password_hash, full_name) VALUES (?, ?, ?)');
  return stmt.run(username, passwordHash, fullName);
}

function updateDriver(id, fullName, username) {
  const stmt = db.prepare('UPDATE drivers SET full_name = ?, username = ? WHERE id = ?');
  return stmt.run(fullName, username, id);
}

function deleteDriver(id) {
  return db.prepare('DELETE FROM drivers WHERE id = ?').run(id);
}

function resetDriverPassword(id, newPassword) {
  const hashedPassword = bcrypt.hashSync(newPassword, 10);
  return db.prepare('UPDATE drivers SET password_hash = ? WHERE id = ?').run(hashedPassword, id);
}

// Admins
function getAdminByUsername(username) {
  return db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
}

function createAdmin(username, passwordHash, fullName) {
  const stmt = db.prepare('INSERT INTO admins (username, password_hash, full_name) VALUES (?, ?, ?)');
  return stmt.run(username, passwordHash, fullName);
}

module.exports = {
  // Buses
  getAllBuses,
  getBusById,
  createBus,
  updateBus,
  deleteBus,
  // Stops
  getAllStops,
  getStopById,
  createStop,
  updateStop,
  deleteStop,
  // Routes
  getBusRoute,
  setBusRoute,
  addStopToRoute,
  removeStopFromRoute,
  // Students
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  resetStudentPassword,
  // Drivers
  getAllDrivers,
  getDriverById,
  createDriver,
  updateDriver,
  deleteDriver,
  resetDriverPassword,
  // Admins
  getAdminByUsername,
  createAdmin,
};