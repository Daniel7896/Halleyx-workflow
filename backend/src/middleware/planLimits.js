const User = require('../models/User');
const Workflow = require('../models/Workflow');
const { getPlanLimits } = require('../config/plans');

/**
 * Middleware to check if user can create more workflows
 */
const checkWorkflowLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });

        const limits = getPlanLimits(user.plan);
        const currentCount = await Workflow.countDocuments({ user_id: req.user.id });

        if (currentCount >= limits.maxWorkflows) {
            return res.status(403).json({
                success: false,
                message: `Workflow limit reached (${limits.maxWorkflows}). Upgrade your plan to create more workflows.`,
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Middleware to check if user can execute more workflows this month
 */
const checkExecutionLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });

        const limits = getPlanLimits(user.plan);

        // Reset monthly counter if needed
        const now = new Date();
        const resetDate = new Date(user.executionResetDate);
        if (now.getMonth() !== resetDate.getMonth() || now.getFullYear() !== resetDate.getFullYear()) {
            user.monthlyExecutionCount = 0;
            user.executionResetDate = now;
            await user.save();
        }

        if (user.monthlyExecutionCount >= limits.maxExecutionsPerMonth) {
            return res.status(403).json({
                success: false,
                message: `Monthly execution limit reached (${limits.maxExecutionsPerMonth}). Upgrade your plan for more executions.`,
                upgradeRequired: true
            });
        }

        // Increment execution count
        user.monthlyExecutionCount += 1;
        await user.save();

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Middleware to check step limit per workflow
 */
const checkStepLimit = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(401).json({ success: false, message: 'User not found' });

        const limits = getPlanLimits(user.plan);
        const Step = require('../models/Step');
        const { workflow_id } = req.params;
        const currentStepCount = await Step.countDocuments({ workflow_id });

        if (currentStepCount >= limits.maxStepsPerWorkflow) {
            return res.status(403).json({
                success: false,
                message: `Step limit reached (${limits.maxStepsPerWorkflow} per workflow). Upgrade your plan to add more steps.`,
                upgradeRequired: true
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { checkWorkflowLimit, checkExecutionLimit, checkStepLimit };
