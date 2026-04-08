var express = require('express');
var router = express.Router();
const jwt = require("jsonwebtoken");
var driverController = require("../controllers/driverController")

// Example route
router.get('/', function(req, res) {
  res.send('Driver main page');
});

router.post('/login', driverController.login)


module.exports = router;