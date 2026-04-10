const driverServices = require('../services/driverServices');
require('dotenv').config();

//Driver login Function
exports.driverLogin = async (req, res) => {
  const inputUsername = req.body.username;
  const inputPassword = req.body.password;
  const foundUser = driverServices.getDriverByUsername(inputUsername);

  if (foundUser) {
    const PasswordStatus = await driverServices.checkDriverPassword(
      foundUser.username,
      inputPassword,
    );
    if (PasswordStatus) {
      //Session
      req.session.user = {
        userId: foundUser.id,
        username: foundUser.username,
        role: 'student',
      };
      return res.status(200).send(req.session.user);
    }
  } else {
    res.status(401).json({ message: 'Wrong username or password' });
  }
};

exports.loginStatus = (req, res) => {
  return req.session.user
    ? res.status(200).send(req.session.user)
    : res.status(401).send('Not Authenticated');
};
