/**
 * Step Controller
 * 
 * Manages workflow steps (Nodes in the directed graph).
 * Verifies workflow ownership before any step operations.
 */
const Step = require('../models/Step');
const Workflow = require('../models/Workflow');

exports.addStep = async (req, res) => {
    try {
        const { workflow_id } = req.params;
        const workflow = await Workflow.findOne({ _id: workflow_id, user_id: req.user.id });
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }
        const step = new Step({ ...req.body, workflow_id });
        await step.save();
        res.status(201).json({ success: true, data: step });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getSteps = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({ _id: req.params.workflow_id, user_id: req.user.id });
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }
        const steps = await Step.find({ workflow_id: req.params.workflow_id }).sort({ order: 1 });
        res.status(200).json({ success: true, data: steps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStep = async (req, res) => {
    try {
        const step = await Step.findById(req.params.id);
        if (!step) {
            return res.status(404).json({ success: false, message: 'Step not found' });
        }
        // Verify ownership through workflow
        const workflow = await Workflow.findOne({ _id: step.workflow_id, user_id: req.user.id });
        if (!workflow) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        const updated = await Step.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteStep = async (req, res) => {
    try {
        const step = await Step.findById(req.params.id);
        if (!step) {
            return res.status(404).json({ success: false, message: 'Step not found' });
        }
        const workflow = await Workflow.findOne({ _id: step.workflow_id, user_id: req.user.id });
        if (!workflow) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }
        await Step.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
