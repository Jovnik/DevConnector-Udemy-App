const express = require('express');
const router = express.Router();

// @route      GET api/posts
// @desc       Test Route   
// @access     Public (dont need to be authorized to access this route);
router.get('/', (req, res) => res.send('Posts route'));

module.exports = router;

