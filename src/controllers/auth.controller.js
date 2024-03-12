const Model = require('../database/db/models');
const User = Model.User;

require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const sendEmail = require('../utils/sendMail');

const saltRounds = +process.env.SALT_ROUNDS;

const register = async (req, res) => {
  try {
    // > Tangkap inputan user
    const { name, email, password } = req.body;

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

    // > Cek user 
    const userExists = await User.findOne({
      where: {
        email: email
      }
    });

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
      errorMessage: error.message
    });
  }
};

module.exports = {
  register,
};