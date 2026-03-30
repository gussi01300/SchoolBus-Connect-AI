var express = require('express');
var router = express.Router();
const dbFunctions = require("../db")

// Example route
router.get('/', function(req, res) {
  res.send('Driver main page');
});

router.post('/login', async function(req, res) {
  const inputUsername = req.body.username
  const inputPassword = req.body.password
  const ifUserExists = dbFunctions.getDriverByUsername(inputUsername)

  if (ifUserExists) {
    const PasswordStatus = await dbFunctions.checkDriverPassword(inputUsername, inputPassword)
    if (PasswordStatus) {
      res.json({ success: true })
      return
    }
  }
  res.status(401).json({ message: "Wrong username or password" })
})


module.exports = router;