const express = require('express');
const router = express.Router();

const checkJWTToken = require('../middleware/checkToken.middleware.js');

const { 
  addNewContact, getContacts, getContactById 
} = require('../controllers/contact.contoller');

router.get('/contact', [checkJWTToken], getContacts);
router.get('/contact/detail/:id', [checkJWTToken], getContactById);
router.post('/contact/insert', [checkJWTToken], addNewContact);

module.exports = router;