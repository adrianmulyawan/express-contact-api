const express = require('express');
const router = express.Router();

const checkJWTToken = require('../middleware/checkToken.middleware.js');

const { 
  addNewContact, getContacts 
} = require('../controllers/contact.contoller');

router.get('/contact', [checkJWTToken], getContacts);
router.post('/contact/insert', [checkJWTToken], addNewContact)

module.exports = router;