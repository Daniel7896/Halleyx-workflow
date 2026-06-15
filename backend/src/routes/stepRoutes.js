const express = require('express');
const {
    addStep,
    getSteps,
    updateStep,
    deleteStep
} = require('../controllers/stepController');
const { checkStepLimit } = require('../middleware/planLimits');

const router = express.Router();

router.route('/workflows/:workflow_id/steps')
    .post(checkStepLimit, addStep)
    .get(getSteps);

router.route('/steps/:id')
    .put(updateStep)
    .delete(deleteStep);

module.exports = router;
