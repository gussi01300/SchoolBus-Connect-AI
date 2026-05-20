const studentServices = require('../services/studentServices');
const busServices = require('../services/busService');
const sseService = require('../services/sseService');

//student login function
exports.studentLogin = async (req, res) => {
  const inputUsername = req.body.username;
  const inputPassword = req.body.password;
  const foundUser = studentServices.getStudentByUsername(inputUsername);

  if (foundUser) {
    const passwordStatus = await studentServices.checkStudentPassword(inputPassword, foundUser.username);

    if (passwordStatus) {
      studentServices.reactivateStudentIfExpired(foundUser.id);
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
  if (!req.session.user) {
    return res.status(401).send('Not Authenticated');
  }
  if (req.session.user.role !== 'student') {
    return res.status(403).send('Forbidden');
  }
  studentServices.reactivateStudentIfExpired(req.session.user.id);
  return res.status(200).send(req.session.user);
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

exports.studentSignOut = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const { untilDate } = req.body;
  studentServices.signOutStudent(req.session.user.id, untilDate || null);
  return res.status(200).json({ message: 'Signed out successfully' });
};

exports.getETA = (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  if (req.session.user.role !== 'student') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { time, message } = busServices.calculateETA(req.session.user);

  return res.status(200).json({
    ETA: time,
    message: message,
  });
};

exports.getBusLiveUpdates = (req, res) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  const student = studentServices.getStudentByID(req.session.user.id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setTimeout(3600000);

  sseService.addClient(student.bus_id, res);

  req.on('close', () => {
    sseService.removeClient(student.bus_id, res);
  });
};
