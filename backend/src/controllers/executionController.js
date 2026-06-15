/**
 * Execution Controller
 * 
 * Handles workflow execution runtime.
 * Scoped to authenticated user for multi-tenancy.
 */
const { executeWorkflow, cancelExecution, retryExecution } = require('../engine/executionEngine');
const Execution = require('../models/Execution');
const Workflow = require('../models/Workflow');

exports.startExecution = async (req, res) => {
    try {
        const { id } = req.params;
        // Verify workflow ownership
        const workflow = await Workflow.findOne({ _id: id, user_id: req.user.id });
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }
        const inputData = req.body;
        const execution = await executeWorkflow(id, inputData, req.user.id);
        res.status(201).json({ success: true, data: execution });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getExecution = async (req, res) => {
    try {
        const execution = await Execution.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!execution) {
            return res.status(404).json({ success: false, message: 'Execution not found' });
        }
        res.status(200).json({ success: true, data: execution });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.cancelExecution = async (req, res) => {
    try {
        const execution = await Execution.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!execution) {
            return res.status(404).json({ success: false, message: 'Execution not found' });
        }
        if (execution.status !== 'in_progress' && execution.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Cannot cancel an execution with status: ${execution.status}`
            });
        }
        const updated = await cancelExecution(req.params.id);
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.retryExecution = async (req, res) => {
    try {
        // Verify ownership
        const existing = await Execution.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Execution not found' });
        }
        const execution = await retryExecution(req.params.id);
        res.status(200).json({ success: true, data: execution });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
