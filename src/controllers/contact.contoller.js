const Model = require('../database/db/models');
const Contact = Model.Contact;
const Address = Model.Address;

const { v4: uuidv4 } = require('uuid');
const validator = require('validator');


const addNewContact = async (req, res) => {
  try {
    // > Tangkap data dari body
    const { first_name, last_name, email, phone_number, addresses } = req.body;

    // > Validasi Body
    if (!first_name ||validator.isEmpty(first_name)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in First Name Field!',
        error: 'First Name is Required!'
      });
    }

    if (!last_name || validator.isEmpty(last_name)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Last Name Field!',
        error: 'Last Name is Required!'
      });
    }

    if (!email || validator.isEmpty(email)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email is Empty!'
      });
    }

    if (!email || validator.isEmail(email) === false) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Email Field!',
        error: 'Email not valid!'
      });
    }

    if (phone_number) {
      if (!validator.isMobilePhone(phone_number)) {
        return res.status(400).json({
          status: 'Failed',
          statusCode: 400,
          message: 'Error in Phone Number Field!',
          error: 'Phone Number not valid!'
        });
      }
    }

    const fullname = first_name + " " + last_name;
    if (!fullname || validator.isEmpty(fullname)) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Error in Full Name Field!',
        error: 'Full Name is Empty!'
      });
    }

    // > Tambah Data Contact
    const dataContact = await Contact.create({
      id: uuidv4(),
      user_id: req.user.id,
      first_name,
      last_name,
      email,
      full_name: fullname,
      phone_number
    });

    // > Bila terjadi kesalahan saat menambahkan data
    if (!dataContact) {
      return res.status(400).json({
        status: 'Failed',
        statusCode: 400,
        message: 'Something error where insert data in contact!',
        error: error.message
      });
    }

    // Jika ada alamat, tambahkan alamat ke kontak (simpan didalam database)
    if (addresses && addresses.length > 0) {
      for (const address of addresses) {
        await Address.create({
          id: uuidv4(),
          contact_id: dataContact.id,
          address_type: address.address_type,
          street: address.street,
          city: address.city,
          province: address.province,
          country: address.country,
          zip_code: address.zip_code
        });
      }
    }    

    return res.status(201).json({
      status: 'Success',
      statusCode: 201,
      message: 'Success Add New Contact!',
      dataContact: dataContact,
      dataAddress: addresses,
      error: []
    });

  } catch (error) {
    return res.status(400).json({
      status: 'Failed',
      statusCode: 400,
      message: 'Something Error in addNewContact Controller!',
      error: error.message
    });
  }
};

module.exports = {
  addNewContact,
};