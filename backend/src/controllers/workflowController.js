/**
 * Workflow Controller
 * 
 * Handles CRUD operations for Workflows.
 * All queries are scoped to the authenticated user (multi-tenancy).
 */
const Workflow = require('../models/Workflow');

exports.createWorkflow = async (req, res) => {
    try {
        const workflow = new Workflow({ ...req.body, user_id: req.user.id });
        await workflow.save();
        res.status(201).json({ success: true, data: workflow });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find({ user_id: req.user.id }).sort({ created_at: -1 });
        res.status(200).json({ success: true, data: workflows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }
        res.status(200).json({ success: true, data: workflow });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }

        const updates = {
            ...req.body,
            version: workflow.version + 1
        };

        const updatedWorkflow = await Workflow.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: updatedWorkflow });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findOneAndDelete({ _id: req.params.id, user_id: req.user.id });
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
