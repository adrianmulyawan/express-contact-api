const express = require('express');
const router = express.Router();

const checkJWTToken = require('../middleware/checkToken.middleware.js');

const { 
  addNewContact 
} = require('../controllers/contact.contoller');

router.post('/contact/insert', [checkJWTToken], addNewContact)

module.exports = router;