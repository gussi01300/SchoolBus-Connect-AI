const adminServices = require('../services/adminServices');
const bcrypt = require('bcrypt');

function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    return `${fieldName} is required`;
  }
  return null;
}

function validateNumber(value, fieldName, options = {}) {
  if (value === undefined || value === null || value === '') {
    if (options.required !== false) return `${fieldName} is required`;
    return null;
  }
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} must be a number`;
  if (options.min !== undefined && num < options.min) return `${fieldName} must be >= ${options.min}`;
  if (options.max !== undefined && num > options.max) return `${fieldName} must be <= ${options.max}`;
  return null;
}

exports.loginStatus = (req, res) => {
  if (!req.session.user) {
    return res.status(401).send('Not Authenticated');
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).send('Forbidden');
  }
  return res.status(200).send(req.session.user);
};

exports.adminLogin = async (req, res) => {
  if (req.session.user) {
    return res.status(400).send('Already logged in');
  }
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }
  const admin = adminServices.getAdminByUsername(username);

  if (admin) {
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (valid) {
      req.session.user = {
        userId: admin.id,
        username: admin.username,
        role: 'admin',
      };
      return res.status(200).send(req.session.user);
    }
  }
  return res.status(401).json({ message: 'Invalid credentials' });
};

exports.adminLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid');
    return res.status(200).send('Logged out successfully');
  });
};

// Buses
exports.getBuses = (req, res) => {
  const buses = adminServices.getAllBuses();
  return res.status(200).json(buses);
};

exports.createBus = (req, res) => {
  const { busNumber, driverId } = req.body;
  const error = validateRequired(busNumber, 'busNumber');
  if (error) return res.status(400).json({ message: error });
  try {
    const result = adminServices.createBus(busNumber, driverId || null);
    return res.status(201).json({ id: result.lastInsertRowid, busNumber, driverId });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.updateBus = (req, res) => {
  const { id } = req.params;
  const { busNumber, driverId } = req.body;
  const error = validateRequired(busNumber, 'busNumber');
  if (error) return res.status(400).json({ message: error });
  try {
    adminServices.updateBus(id, busNumber, driverId || null);
    return res.status(200).json({ message: 'Bus updated' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.deleteBus = (req, res) => {
  const { id } = req.params;
  adminServices.deleteBus(id);
  return res.status(200).json({ message: 'Bus deleted' });
};

// Stops
exports.getStops = (req, res) => {
  const stops = adminServices.getAllStops();
  return res.status(200).json(stops);
};

exports.createStop = (req, res) => {
  const { stopName, address, latitude, longitude } = req.body;
  const error = validateRequired(stopName, 'stopName') || validateRequired(address, 'address');
  if (error) return res.status(400).json({ message: error });
  const latError = validateNumber(latitude, 'latitude', { min: -90, max: 90 });
  if (latError) return res.status(400).json({ message: latError });
  const lonError = validateNumber(longitude, 'longitude', { min: -180, max: 180 });
  if (lonError) return res.status(400).json({ message: lonError });
  try {
    const result = adminServices.createStop(stopName, address, latitude, longitude);
    return res.status(201).json({ id: result.lastInsertRowid, stopName, address });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.updateStop = (req, res) => {
  const { id } = req.params;
  const { stopName, address, latitude, longitude } = req.body;
  const error = validateRequired(stopName, 'stopName') || validateRequired(address, 'address');
  if (error) return res.status(400).json({ message: error });
  const latError = validateNumber(latitude, 'latitude', { min: -90, max: 90 });
  if (latError) return res.status(400).json({ message: latError });
  const lonError = validateNumber(longitude, 'longitude', { min: -180, max: 180 });
  if (lonError) return res.status(400).json({ message: lonError });
  try {
    adminServices.updateStop(id, stopName, address, latitude, longitude);
    return res.status(200).json({ message: 'Stop updated' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.deleteStop = (req, res) => {
  const { id } = req.params;
  adminServices.deleteStop(id);
  return res.status(200).json({ message: 'Stop deleted' });
};

// Routes
exports.getBusRoute = (req, res) => {
  const { busId } = req.params;
  const route = adminServices.getBusRoute(busId);
  return res.status(200).json(route);
};

exports.setBusRoute = (req, res) => {
  const { busId } = req.params;
  const { stopIds } = req.body;
  if (!Array.isArray(stopIds)) {
    return res.status(400).json({ message: 'stopIds must be an array' });
  }
  try {
    adminServices.setBusRoute(parseInt(busId), stopIds);
    return res.status(200).json({ message: 'Route updated' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

// Students
exports.getStudents = (req, res) => {
  const students = adminServices.getAllStudents();
  return res.status(200).json(students);
};

exports.createStudent = async (req, res) => {
  const { username, password, fullName, busId, stopId } = req.body;
  const error = validateRequired(username, 'username') || validateRequired(password, 'password') || validateRequired(fullName, 'fullName');
  if (error) return res.status(400).json({ message: error });
  if (!busId || !stopId) return res.status(400).json({ message: 'busId and stopId are required' });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = adminServices.createStudent(username, hashedPassword, fullName, busId, stopId);
    return res.status(201).json({ id: result.lastInsertRowid, username, fullName });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.updateStudent = (req, res) => {
  const { id } = req.params;
  const { fullName, busId, stopId, signedOut } = req.body;
  const error = validateRequired(fullName, 'fullName');
  if (error) return res.status(400).json({ message: error });
  if (!busId || !stopId) return res.status(400).json({ message: 'busId and stopId are required' });
  try {
    adminServices.updateStudent(id, fullName, busId, stopId, signedOut);
    return res.status(200).json({ message: 'Student updated' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.deleteStudent = (req, res) => {
  const { id } = req.params;
  adminServices.deleteStudent(id);
  return res.status(200).json({ message: 'Student deleted' });
};

exports.resetStudentPassword = (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const error = validateRequired(newPassword, 'newPassword');
  if (error) return res.status(400).json({ message: error });
  try {
    adminServices.resetStudentPassword(id, newPassword);
    return res.status(200).json({ message: 'Password reset' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

// Drivers
exports.getDrivers = (req, res) => {
  const drivers = adminServices.getAllDrivers();
  return res.status(200).json(drivers);
};

exports.createDriver = async (req, res) => {
  const { username, password, fullName } = req.body;
  const error = validateRequired(username, 'username') || validateRequired(password, 'password') || validateRequired(fullName, 'fullName');
  if (error) return res.status(400).json({ message: error });
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = adminServices.createDriver(username, hashedPassword, fullName);
    return res.status(201).json({ id: result.lastInsertRowid, username, fullName });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.updateDriver = (req, res) => {
  const { id } = req.params;
  const { fullName, username } = req.body;
  const error = validateRequired(fullName, 'fullName') || validateRequired(username, 'username');
  if (error) return res.status(400).json({ message: error });
  try {
    adminServices.updateDriver(id, fullName, username);
    return res.status(200).json({ message: 'Driver updated' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};

exports.deleteDriver = (req, res) => {
  const { id } = req.params;
  adminServices.deleteDriver(id);
  return res.status(200).json({ message: 'Driver deleted' });
};

exports.resetDriverPassword = (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;
  const error = validateRequired(newPassword, 'newPassword');
  if (error) return res.status(400).json({ message: error });
  try {
    adminServices.resetDriverPassword(id, newPassword);
    return res.status(200).json({ message: 'Password reset' });
  } catch (e) {
    return res.status(400).json({ message: e.message });
  }
};