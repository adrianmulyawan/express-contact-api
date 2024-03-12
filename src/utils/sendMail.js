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

module.exports = sendEmail;