const nodemailer = require('nodemailer');
require('dotenv').config();

const baseUrl = process.env.BASE_URL;

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  auth : {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD
  }
});

const createEmail = (email, token) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Registration Confirmation',
    html:
      "<h3>For Activate Account, click link bellow</h3>" +
      "<a href='" +
      baseUrl +
      "/api/v1/users/activate/" +
      token +
      "'>Link Activasi</a>",
  };
};

const createResetPassword = (email, password) => {
  return {
    from: process.env.MAIL_FROM,
    to: email,
    subject: 'Forgot Password',
    html:
      "<h3>Your new account password is :</h3>" +
      "<table>" +
      "<tr><td>Email :</td><td>" +
      email +
      "</td></tr>" +
      "<tr><td>Password :</td><td>" +
      password +
      "</td></tr>" +
      "</table>",
  };
};

const sendEmail = async (email, token) => {
  try {
    const info = await transporter.sendMail(createEmail(email, token));
    console.info(`Email sent : ${info.response}`);
    return true;
  } catch (error) {
    console.info(error);
    throw error;
  }
};

const sendResetPassword = async (email, password) => {
  try {
    const info = await transporter.sendMail(createResetPassword(email, password));
    console.info(`Email sent: ${info.response}`);
    return true;
  } catch (error) {
    console.info(error.message);
    throw error;
  }
};

module.exports = {
  sendEmail,
  sendResetPassword,
};