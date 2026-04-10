const studentServices = require('../services/studentServices');

//student login function
exports.studentLogin = async (req, res) => {
  const inputUsername = req.body.username;
  const inputPassword = req.body.password;
  const foundUser = studentServices.getStudentByUsername(inputUsername);

  if (foundUser) {
    const passwordStatus = await studentServices.checkStudentPassword;

    if (passwordStatus) {
      //session
      req.session.user = foundUser;
      return res.status(200).send(foundUser.username);
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
