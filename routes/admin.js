var express = require('express');
var router = express.Router();
var adminController = require('../controllers/adminController');
var adminAuth = require('../middleware/adminAuth');

// Login/Logout
router.post('/login', adminController.adminLogin);
router.get('/login/status', adminController.loginStatus);
router.post('/logout', adminAuth.requireAdmin, adminController.adminLogout);

// Buses
router.get('/buses', adminAuth.requireAdmin, adminController.getBuses);
router.post('/buses', adminAuth.requireAdmin, adminController.createBus);
router.put('/buses/:id', adminAuth.requireAdmin, adminController.updateBus);
router.delete('/buses/:id', adminAuth.requireAdmin, adminController.deleteBus);

// Stops
router.get('/stops', adminAuth.requireAdmin, adminController.getStops);
router.post('/stops', adminAuth.requireAdmin, adminController.createStop);
router.put('/stops/:id', adminAuth.requireAdmin, adminController.updateStop);
router.delete('/stops/:id', adminAuth.requireAdmin, adminController.deleteStop);

// Routes
router.get('/routes/:busId', adminAuth.requireAdmin, adminController.getBusRoute);
router.post('/routes/:busId', adminAuth.requireAdmin, adminController.setBusRoute);

// Students
router.get('/students', adminAuth.requireAdmin, adminController.getStudents);
router.post('/students', adminAuth.requireAdmin, adminController.createStudent);
router.put('/students/:id', adminAuth.requireAdmin, adminController.updateStudent);
router.delete('/students/:id', adminAuth.requireAdmin, adminController.deleteStudent);
router.post('/students/:id/reset-password', adminAuth.requireAdmin, adminController.resetStudentPassword);

// Drivers
router.get('/drivers', adminAuth.requireAdmin, adminController.getDrivers);
router.post('/drivers', adminAuth.requireAdmin, adminController.createDriver);
router.put('/drivers/:id', adminAuth.requireAdmin, adminController.updateDriver);
router.delete('/drivers/:id', adminAuth.requireAdmin, adminController.deleteDriver);
router.post('/drivers/:id/reset-password', adminAuth.requireAdmin, adminController.resetDriverPassword);

module.exports = router;