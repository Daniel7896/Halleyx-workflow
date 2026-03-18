const express = require('express');
const {
    addRule,
    getRules,
    updateRule,
    deleteRule
} = require('../controllers/ruleController');

const router = express.Router();

router.route('/steps/:step_id/rules')
    .post(addRule)
    .get(getRules);

router.route('/rules/:id')
    .put(updateRule)
    .delete(deleteRule);

module.exports = router;
