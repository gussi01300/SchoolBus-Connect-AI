var express = require('express');
var router = express.Router();
const studentController = require('../controllers/studentController');

router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', studentController.studentLogin);
router.post('/logout', studentController.studentLogout);
router.post('/signout', studentController.studentSignOut);

router.get('/login/status', studentController.loginStatus);

router.get('/getETA', studentController.getETA);
router.get('/bus/live', studentController.getBusLiveUpdates);

module.exports = router;
