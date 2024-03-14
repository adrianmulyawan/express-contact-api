const Model = require('../database/db/models');
const User = Model.User;

require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const sendEmail = require('../utils/sendMail');
const jwt = require('jsonwebtoken');
const { use } = require('../routes/auth.route');

const saltRounds = +process.env.SALT_ROUNDS;

const register = async (req, res) => {
  try {
    // > Tangkap inputan user
    const { name, email, password, confirmPassword } = req.body;

    // > Validasi Inputan
    if (validator.isEmpty(name)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Name Field!',
        error: 'Name is Empty!'
      });
    } 

    if (validator.isEmpty(email)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email is Empty!'
      });
    }

    if (validator.isEmail(email) === false) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email not valid!'
      });
    }

    const sanitizePassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0
    });
    if (sanitizePassword === false) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Password Field!',
        error: 'Password Recuirment min length = 8, min lowercase = 1, min uppercase = 1, min number = 1'
      });
    }

    if (validator.isEmpty(confirmPassword)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Password Confirmation Field!',
        error: 'Password Confirmation is Empty!'
      });
    }

    // > Validasi apakah password dan password confirmation itu samaa
    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Registration Failed!',
        error: 'Password amd Password Confirmation is dont match!'
      });
    }

    // > Cek user 
    const userExists = await User.findOne({
      where: {
        email: email
      }
    });
    // console.info(userExists)

    if (userExists && userExists.isActive) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Email has been used and actived!',
        error: 'Email is already activated!'
      });
    } else if (userExists && !userExists.isActive && Date.parse(userExists.expiredTime) > new Date()) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Email has been used and actived!',
        error: 'Email already registered, please check your email!'
      });
    } else {
      User.destroy({
        where: {
          email: email
        }
      });
    }

    // > Encrypt password
    const encryptPassword = await bcrypt.hash(password, saltRounds);
    
    // > Create user
    const dataUser = await User.create({
      id: uuidv4(),
      name: name,
      email: email,
      password: encryptPassword,
      expiredTime: new Date(),
    });

    // > Send email verification 
    const result = await sendEmail(dataUser.email, dataUser.id);
    if (!result) {
      // > Result Error
      return res.status(500).json({
        status: 'Failed',
        statusCode: 500,
        message: 'Register Failed!',
        error: 'Error Send Email Verification!'
      });
    } else {
      // > Result Success
      return res.status(201).json({
        status: 'Success',
        statusCode: 201,
        message: 'Register Successfully, Please Check Your Email!',
        data: {
          userId: dataUser.id,
          name: dataUser.name,
          email: dataUser.email,
          expiredTime: dataUser.expiredTime
        }
      });
    }

  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in Register Controller!',
      error: error.message
    });
  }
};

const activationAccount = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findOne({
      where: {
        id: userId,
        isActive: false
      }
    });

    // console.info(user, '=> data user');

    if (!user) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Activation Account Failed',
        error: 'User Not Found!'
      });
    } else {
      user.isActive = true;
      user.expiredTime = null
      await user.save();

      return res.status(200).json({
        status: 'Success',
        statusCode: 200,
        message: 'Activation Account Successfully!',
        data: {
          userId: user.id,
          name: user.name,
          email: user.email,
          isActive: user.isActive
        }
      });
    }

  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in Activation Account Controller!',
      error: error.message
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    return res.status(200).json({
      status: 'Success',
      statusCode: 200,
      message: 'List of All Users!',
      data: users
    });

  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in getUsers Controller!',
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    // > Get data from body
    const { email, password } = req.body;

    // > Validasi form
    if (validator.isEmpty(email)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email is Empty!'
      });
    }

    if (validator.isEmail(email) === false) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email not valid!'
      });
    }

    if (validator.isEmpty(password)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Password Field!',
        error: 'Password is Required!'
      });
    }

    // > cari user berdasarkan email
    const user = await User.findOne({
      where: {
        email,
        isActive: true
      }
    });

    // > email tidak valid
    if (!user) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Login Process!',
        error: 'Email not valid!'
      });
    } 
    // > email valid
    else {
      // > compare password
      const decryptPassword = await bcrypt.compare(password, user.password);

      // > password dont match
      if (!decryptPassword) {
        return res.status(400).json({
          status: 'Failed',
          statusCode: 400,
          message: 'Error in Login Process!',
          error: 'Check again your email and password!'
        });
      } 
      // > password match
      else {
        // > Data user login
        const dataUser = {
          id: user.id,
          name: user.name,
          email: user.email
        };

        // > create access token
        const generateAccessToken = jwt.sign(dataUser, process.env.PRIVATE_KEY, {
          expiresIn: process.env.JWT_EXPIRED_IN
        });

        // > create refresh token
        const generateRefreshToken = jwt.sign(dataUser, process.env.REFRESH_PRIVATE_KEY, {
          expiresIn: process.env.JWT_REFRESH_EXPIRED_IN
        });

        // > Result
        return res.status(200).json({
          status: 'Success',
          statusCode: 200,
          message: 'Login Successfully!',
          data: dataUser,
          accessToken: generateAccessToken,
          refreshToken: generateRefreshToken
        });
      }
    }

  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in Login Controller!',
      error: error.message
    });
  }
}

const refreshToken = async (req, res) => {
  try {
    // > Tangkap bearer token yang dikirim oleh user
    // => Setelah itu sanitize & ambil tokennya saja
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    // > Bila token tidak ada
    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Unauthorized!',
        error: 'Refresh Token is Required!'
      });
    }

    // > Verify token jwt 
    const verifyToken = jwt.verify(token, process.env.REFRESH_PRIVATE_KEY);
    if (!verifyToken) {
      return res.status(401).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Unauthorized!',
        error: 'Refresh Token is Invalid!'
      });
    }

    // > Token match 
    const user = await User.findOne({
      where: {
        email: verifyToken.email,
        isActive: true
      }
    });

    if (!user) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'User Not Found!',
        error: 'User Not Found!'
      });
    } else {
      const dataUser = {
        id: user.id,
        name: user.name,
        email: user.email
      }

      const generateAccessToken = jwt.sign(dataUser, process.env.PRIVATE_KEY, {
        expiresIn: process.env.JWT_EXPIRED_IN
      });

      const generateRefreshToken = jwt.sign(dataUser, process.env.REFRESH_PRIVATE_KEY, {
        expiresIn: process.env.JWT_REFRESH_EXPIRED_IN
      });

      return res.status(200).json({
        status: 'Success',
        statusCode: 200,
        message: 'Refresh Token Successfully!',
        data: dataUser,
        accessToken: generateAccessToken,
        refreshToken: generateRefreshToken
      });
    }
  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in refreshToken Controller!',
      error: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, password, confirmPassword, oldPassword } = req.body;

    // > Validasi Inputan
    if (validator.isEmpty(name)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Name Field!',
        error: 'Name is Empty!'
      });
    } 

    if (validator.isEmpty(email)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email is Empty!'
      });
    }

    if (validator.isEmail(email) === false) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email not valid!'
      });
    }

    const sanitizePassword = validator.isStrongPassword(password, {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0
    });
    if (sanitizePassword === false) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Password Field!',
        error: 'Password Recuirment min length = 8, min lowercase = 1, min uppercase = 1, min number = 1'
      });
    }

    if (validator.isEmpty(oldPassword)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Old Password Field!',
        error: 'Old Password is Empty!'
      });
    }

    if (validator.isEmpty(confirmPassword)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Password Confirmation Field!',
        error: 'Password Confirmation is Empty!'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Registration Failed!',
        error: 'Password amd Password Confirmation is dont match!'
      });
    }

    // Cari data user 
    const user = await User.findOne({
      where: {
        id: userId,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        statusCode: 404,
        message: 'Something Error!',
        error: 'User Not Found!'
      });
    }

    const checkPassword = await bcrypt.compare(oldPassword, user.password);

    if (!checkPassword) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Something Error in Old Password!',
        error: 'Old Password Not Match!'
      });
    } else {
      const encryptPassword = await bcrypt.hash(password, saltRounds);

     const result = await user.update({
      email: email || user.email,
      name: name || user.name,
      password: encryptPassword || user.password
     });

     return res.status(200).json({
      status: 'Success',
      statusCode: 200,
      message: 'Success Update User Profile',
      data: {
        result
      }
     });
    }

  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in updateProfile Controller!',
      error: error.message
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.destroy({
      where: {
        id: userId,
        isActive: true
      }
    });

    if (!user) {
      return res.status(404).json({
        status: 'Failed',
        statusCode: 404,
        message: 'Delete Failed!',
        error: 'User Not Found!'
      });
    }

    return res.status(200).json({
      status: 'Success',
      statusCode: 200,
      message: 'Success Delete User!',
      data: null
    });

  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in deleteAccount Controller!',
      error: error.message
    });
  }
}

module.exports = {
  register,
  activationAccount,
  getUsers,
  login,
  refreshToken,
  updateProfile,
  deleteAccount
};