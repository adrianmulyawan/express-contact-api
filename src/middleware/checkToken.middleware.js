const jwt = require('jsonwebtoken');
require('dotenv').config();

const checkJWTToken = async (req, res, next) => {
  try {
    const bearerToken = req.get('Authorization');
    const token = bearerToken && bearerToken.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        status: 'Failed',
        statusCode: 401,
        message: 'Unauthorized!',
        error: 'Token is Required!'
      });
    }

    const verifyToken = jwt.verify(token, process.env.PRIVATE_KEY);

    if (!verifyToken) {
      return res.status(401).json({
        status: 'Failed',
        statusCode: 401,
        message: 'Unauthorized!',
        error: 'Token is Not Valid!'
      });
    }

    req.user = verifyToken;
    next();
  } catch (error) {
    return res.status(401).json({
      status: 'Failed',
      statusCode: 401,
      message: 'Couldnt Authenticate',
      error: error.message
    });
  }
}; 

module.exports = checkJWTToken;