const driverServices = require('../services/driverServices');
require('dotenv').config();

//Driver login Function
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
      //Session
      console.log(req.session.id);
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
