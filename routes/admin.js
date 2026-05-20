var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
var adminAuth = require('../middleware/adminAuth');

// Login/Logout
router.post('/login', adminController.adminLogin);
router.get('/login/status', adminController.loginStatus);
router.post('/logout', adminAuth, adminController.adminLogout);

// Buses
router.get('/buses', adminAuth, adminController.getBuses);
router.post('/buses', adminAuth, adminController.createBus);
router.put('/buses/:id', adminAuth, adminController.updateBus);
router.delete('/buses/:id', adminAuth, adminController.deleteBus);

// Stops
router.get('/stops', adminAuth, adminController.getStops);
router.post('/stops', adminAuth, adminController.createStop);
router.put('/stops/:id', adminAuth, adminController.updateStop);
router.delete('/stops/:id', adminAuth, adminController.deleteStop);

// Routes
router.get('/routes/:busId', adminAuth, adminController.getBusRoute);
router.post('/routes/:busId', adminAuth, adminController.setBusRoute);

// Students
router.get('/students', adminAuth, adminController.getStudents);
router.post('/students', adminAuth, adminController.createStudent);
router.put('/students/:id', adminAuth, adminController.updateStudent);
router.delete('/students/:id', adminAuth, adminController.deleteStudent);
router.post('/students/:id/reset-password', adminAuth, adminController.resetStudentPassword);

// Drivers
router.get('/drivers', adminAuth, adminController.getDrivers);
router.post('/drivers', adminAuth, adminController.createDriver);
router.put('/drivers/:id', adminAuth, adminController.updateDriver);
router.delete('/drivers/:id', adminAuth, adminController.deleteDriver);
router.post('/drivers/:id/reset-password', adminAuth, adminController.resetDriverPassword);

module.exports = router;