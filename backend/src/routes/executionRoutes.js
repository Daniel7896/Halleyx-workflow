const express = require('express');
const {
    getExecution,
    cancelExecution,
    retryExecution
} = require('../controllers/executionController');

const router = express.Router();

// Routes mounted under /api/executions
router.get('/:id', getExecution);
router.post('/:id/cancel', cancelExecution);
router.post('/:id/retry', retryExecution);

module.exports = router;
