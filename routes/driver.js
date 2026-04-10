var express = require('express');
var router = express.Router();
var driverController = require('../controllers/driverController');

// Example route
router.get('/', function (req, res) {
  res.send('Driver main page');
});

router.post('/login', driverController.driverLogin);

router.get('/loginStatus', driverController.loginStatus);

module.exports = router;
