var express = require('express');
var router = express.Router();
const studentController = require('../controllers/studentController');

/* GET users listing. */
router.get('/', function (req, res, next) {
  console.log(req.session);
  console.log(req.sessionID);
  req.session.visited = true;
  res.send('respond with a resource');
});

router.post('/login', studentController.studentLogin);

router.get('/login/status', studentController.loginStatus);

module.exports = router;
