const driverServices = require("../services/driverServices");
require("dotenv").config();



//Driver login Function
exports.login = async (req, res) => {
    const inputUsername = req.body.username
    const inputPassword = req.body.password
    const foundUser = driverServices.getDriverByUsername(inputUsername)
    
    if (foundUser) {
        const PasswordStatus = await driverServices.checkDriverPassword(foundUser.username, inputPassword)
        if (PasswordStatus) {
            //Session
          
        }
    }
    res.status(401).json({ message: "Wrong username or password" })
}