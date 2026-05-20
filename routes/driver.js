var express = require('express');
var router = express.Router();
var driverController = require('../controllers/driverController');

router.get('/', function (req, res) {
  res.send('Driver main page');
});

router.post('/login', driverController.driverLogin);
router.post('/logout', driverController.driverLogout);

router.get('/loginStatus', driverController.loginStatus);

router.post('/location', driverController.updateLocation);
router.post('/pickup', driverController.markPickup);
router.get('/next-stop', driverController.getNextStop);

module.exports = router;
