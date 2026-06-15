const express = require('express');
const { getDashboardStats } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/dashboard', getDashboardStats);

module.exports = router;
