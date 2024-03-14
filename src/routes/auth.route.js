const express = require('express');
const router = express.Router();

const { 
  register,
  activationAccount, 
  getUsers,
  login, 
  refreshToken, 
  updateProfile
} = require('../controllers/auth.controller.js');
const { 
  checkUserEmail 
} = require('../middleware/checkEmail.middleware.js');
const checkJWTToken = require('../middleware/checkToken.middleware.js');

router.post('/register', [checkUserEmail], register);
router.get('/users', getUsers);
router.get('/users/activate/:id', activationAccount);
router.post('/login', login);
router.get('/users/refresh', refreshToken);
router.patch('/users/profile/:id', [checkJWTToken], updateProfile);

module.exports = router;