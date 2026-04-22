const studentServices = require('../services/studentServices');
const busServices = require('../services/busService');

//student login function
exports.studentLogin = async (req, res) => {
  const inputUsername = req.body.username;
  const inputPassword = req.body.password;
  const foundUser = studentServices.getStudentByUsername(inputUsername);

  if (foundUser) {
    const passwordStatus = await studentServices.checkStudentPassword(inputPassword, foundUser.username);

    if (passwordStatus) {
      //session
      req.session.user = {
        id: foundUser.id,
        role: 'student',
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

exports.studentLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Failed to logout');
    }
    res.clearCookie('connect.sid');
    return res.status(200).send('Logged out successfully');
  });
};

exports.getETA = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.session.user.role !== 'student') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const ETA = busServices.calculateETA(req.session.user);
  console.log(ETA);
  return res.status(200).json({ ETA: ETA });
};
