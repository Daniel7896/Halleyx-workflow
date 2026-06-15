/**
 * Rule Controller
 * 
 * Manages the rule "Edges" of the directed graph.
 * Verifies ownership through step → workflow → user chain.
 */
const Rule = require('../models/Rule');
const Step = require('../models/Step');
const Workflow = require('../models/Workflow');

// Helper to verify step ownership
const verifyStepOwnership = async (stepId, userId) => {
    const step = await Step.findById(stepId);
    if (!step) return null;
    const workflow = await Workflow.findOne({ _id: step.workflow_id, user_id: userId });
    if (!workflow) return null;
    return step;
};

exports.addRule = async (req, res) => {
    try {
        const { step_id } = req.params;
        const step = await verifyStepOwnership(step_id, req.user.id);
        if (!step) {
            return res.status(404).json({ success: false, message: 'Step not found' });
        }
        const rule = new Rule({ ...req.body, step_id });
        await rule.save();
        res.status(201).json({ success: true, data: rule });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getRules = async (req, res) => {
    try {
        const step = await verifyStepOwnership(req.params.step_id, req.user.id);
        if (!step) {
            return res.status(404).json({ success: false, message: 'Step not found' });
        }
        const rules = await Rule.find({ step_id: req.params.step_id }).sort({ priority: 1 });
        res.status(200).json({ success: true, data: rules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRule = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({ success: false, message: 'Rule not found' });
        }
        const step = await verifyStepOwnership(rule.step_id, req.user.id);
        if (!step) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const updated = await Rule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteRule = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({ success: false, message: 'Rule not found' });
        }
        const step = await verifyStepOwnership(rule.step_id, req.user.id);
        if (!step) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        await Rule.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
