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
      res.sendStatus(200);
    }
  } else {
    res.status(401).json({ message: 'Wrong username or password' });
  }
};
