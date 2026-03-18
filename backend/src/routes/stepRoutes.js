const express = require('express');
const {
    addStep,
    getSteps,
    updateStep,
    deleteStep
} = require('../controllers/stepController');

const router = express.Router();

router.route('/workflows/:workflow_id/steps')
    .post(addStep)
    .get(getSteps);

router.route('/steps/:id')
    .put(updateStep)
    .delete(deleteStep);

module.exports = router;
