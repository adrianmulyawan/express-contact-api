const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  return res.status(200).json({
    status: 'Success',
    statusCode: 200,
    message: 'Hello this is express contact api!'
  });
});

module.exports = router;