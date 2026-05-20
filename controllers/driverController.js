const driverServices = require('../services/driverServices');
const sseService = require('../services/sseService');
require('dotenv').config();

exports.driverLogin = async (req, res) => {
  if (req.session.user) {
    return res.status(400).send('Already logged in');
  }
  const inputUsername = req.body.username;
  const inputPassword = req.body.password;
  const foundUser = driverServices.getDriverByUsername(inputUsername);

  if (foundUser) {
    const PasswordStatus = await driverServices.checkDriverPassword(foundUser.username, inputPassword);
    if (PasswordStatus) {
      req.session.user = {
        userId: foundUser.id,
        username: foundUser.username,
        role: 'driver',
      };
      return res.status(200).send(req.session.user);
    }
  } else {
    res.status(401).json({ message: 'Wrong username or password' });
  }
};

exports.loginStatus = (req, res) => {
  return req.session.user ? res.status(200).send(req.session.user) : res.status(401).send('Not Authenticated');
};

exports.driverLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid');
    return res.status(200).send('Logged out successfully');
  });
};

exports.updateLocation = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'driver') {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const { latitude, longitude, source } = req.body;
  driverServices.newLocation(req.session.user.username, latitude, longitude, source || 'geolocation');

  const bus = driverServices.getBusByDriverId(req.session.user.userId);
  if (bus) {
    sseService.broadcastLocation(bus.id, { latitude, longitude, source, timestamp: Date.now() });
  }

  return res.status(200).json({ message: 'Location updated' });
};

exports.markPickup = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'driver') {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const { stopId } = req.body;
  const bus = driverServices.getBusByDriverId(req.session.user.userId);
  if (!bus) {
    return res.status(404).json({ message: 'No bus assigned to this driver' });
  }

  const studentsPickedUp = driverServices.markAllStudentsAtStopPickedUp(stopId, bus.id);
  return res.status(200).json({ message: 'Students marked as picked up', count: studentsPickedUp });
};

exports.getNextStop = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'driver') {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const nextStop = driverServices.calcNextStop(req.session.user.username);
  if (!nextStop) {
    return res.status(404).json({ message: 'No next stop found' });
  }

  const bus = driverServices.getBusByDriverId(req.session.user.userId);
  const studentsAtStop = bus ? driverServices.getStudentsAtStop(nextStop.id, bus.id) : [];

  return res.status(200).json({
    stop: nextStop,
    studentsWaiting: studentsAtStop.length,
    students: studentsAtStop.map(s => ({ id: s.id, full_name: s.full_name }))
  });
};
