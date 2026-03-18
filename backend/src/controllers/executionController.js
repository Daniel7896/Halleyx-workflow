/**
 * Execution Controller
 * 
 * ARCHITECTURE OVERVIEW:
 * This controller handles the "Runtime" of the workflow. 
 * While the other controllers just save data (Design Time), this controller 
 * actually calls our custom Execution Engine to process the data and 
 * run the graph traversal logic (Run Time).
 */
const { executeWorkflow, cancelExecution, retryExecution } = require('../engine/executionEngine');
const Execution = require('../models/Execution');

exports.startExecution = async (req, res) => {
    try {
        const { id } = req.params;   // :id from /api/workflows/:id/execute
        const inputData = req.body;
        const execution = await executeWorkflow(id, inputData, 'api');
        res.status(201).json({ success: true, data: execution });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getExecution = async (req, res) => {
    try {
        const execution = await Execution.findById(req.params.id);
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
        const execution = await Execution.findById(req.params.id);
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
        const execution = await retryExecution(req.params.id);
        res.status(200).json({ success: true, data: execution });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
