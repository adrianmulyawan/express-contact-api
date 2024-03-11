const Model = require('../database/db/models');
const User = Model.User;

require('dotenv').config();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const saltRounds = +process.env.SALT_ROUNDS;

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Name, Email, and Password is Required!'
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

    const encryptPassword = await bcrypt.hash(password, saltRounds);
    
    const dataUser = await User.create({
      id: uuidv4(),
      name: name,
      email: email,
      password: encryptPassword,
      expiredTime: new Date(),
    });

    return res.status(201).json({
      status: 'Success',
      statusCode: 201,
      message: 'Register Successfully!',
      data: {
        userId: dataUser.id,
        name: dataUser.name,
        email: dataUser.email,
        expiredTime: dataUser.expiredTime
      }
    });

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