const express = require('express');
const router = express.Router();
const config = require('../config');

// get all channels and categorize them by creation
router.get('/', (req, res, next) => {
    res.json({
        success: true,
        api_key: config.amplitude.api_key
    });
});

module.exports = router;