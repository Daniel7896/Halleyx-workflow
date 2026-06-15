const express = require('express');
const {
    createWorkflow,
    getWorkflows,
    getWorkflow,
    updateWorkflow,
    deleteWorkflow
} = require('../controllers/workflowController');
const { startExecution } = require('../controllers/executionController');
const { checkWorkflowLimit, checkExecutionLimit } = require('../middleware/planLimits');

const router = express.Router();

router.route('/')
    .post(checkWorkflowLimit, createWorkflow)
    .get(getWorkflows);

router.route('/:id')
    .get(getWorkflow)
    .put(updateWorkflow)
    .delete(deleteWorkflow);

// Execute a workflow: POST /api/workflows/:id/execute
router.post('/:id/execute', checkExecutionLimit, startExecution);

module.exports = router;
