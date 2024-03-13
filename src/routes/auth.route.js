const express = require('express');
const router = express.Router();

const { 
  register,
  activationAccount, 
  getUsers,
  login, 
  refreshToken 
} = require('../controllers/auth.controller.js');
const { 
  checkUserEmail 
} = require('../middleware/checkEmail.middleware.js');

router.post('/register', [checkUserEmail], register);
router.get('/users', getUsers);
router.get('/users/activate/:id', activationAccount);
router.post('/login', login);
router.get('/users/refresh', refreshToken);

module.exports = router;