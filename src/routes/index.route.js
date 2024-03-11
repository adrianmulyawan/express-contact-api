const express = require('express');
const router = express.Router();

const authRouter = require('./auth.route.js');

router.get('/', (req, res) => {
  return res.status(200).json({
    status: 'Success',
    statusCode: 200,
    message: 'Hello this is express contact api!'
  });
});
router.use('/api/v1', authRouter);

module.exports = router;