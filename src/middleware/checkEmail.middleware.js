const Model = require('../database/db/models');
const User = Model.User;

const checkUserEmail = async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    where: {
      email: email
    }
  });

  // console.info(user.isActive);

  if (user) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Email has been used!'
    });
  }

  next();
};

// const checkLoginEmail = async (req, res) => {
//   const { email } = req.body;

//   const user = 
// };

module.exports = {
  checkUserEmail
};