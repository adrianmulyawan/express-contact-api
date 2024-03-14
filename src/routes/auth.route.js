const express = require('express');
const router = express.Router();

const { 
  register,
  activationAccount, 
  getUsers,
  login, 
  refreshToken, 
  updateProfile,
  deleteAccount
} = require('../controllers/auth.controller.js');
const { 
  checkUserEmail 
} = require('../middleware/checkEmail.middleware.js');
const checkJWTToken = require('../middleware/checkToken.middleware.js');

// > Route Auth
// => Register
router.post('/register', [checkUserEmail], register);
// => Menampilkan seluruh data user
router.get('/users', getUsers);
// => Melakukan verifikasi email
router.get('/users/activate/:id', activationAccount);
// => Login
router.post('/login', login);
// => Refresh token
router.get('/users/refresh', refreshToken);
// => Update profile
router.patch('/users/profile/:id', [checkJWTToken], updateProfile);
// => Delete account
router.delete('/users/delete/:id', [checkJWTToken], deleteAccount);

module.exports = router;