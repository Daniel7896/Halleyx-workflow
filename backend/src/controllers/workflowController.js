/**
 * Workflow Controller
 * 
 * ARCHITECTURE OVERVIEW:
 * In a modern REST API, a "Controller" acts as the traffic cop between the
 * network routes (URLs) and the Database. 
 * 
 * This file handles CRUD (Create, Read, Update, Delete) operations for Workflows.
 * All functions are marked `async` because database operations take time, 
 * and we want the server to handle other requests while waiting (non-blocking).
 */
const Workflow = require('../models/Workflow');

exports.createWorkflow = async (req, res) => {
    try {
        const workflow = new Workflow(req.body);
        await workflow.save();
        res.status(201).json({ success: true, data: workflow });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.getWorkflows = async (req, res) => {
    try {
        const workflows = await Workflow.find().sort({ created_at: -1 });
        res.status(200).json({ success: true, data: workflows });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getWorkflow = async (req, res) => {
    try {
        const workflow = await Workflow.findById(req.params.id);
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
        const workflow = await Workflow.findById(req.params.id);
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }

        // FIX 3.2: Always increment version on every PUT
        const updates = {
            ...req.body,
            version: workflow.version + 1  // explicit increment
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
        const workflow = await Workflow.findByIdAndDelete(req.params.id);
        if (!workflow) {
            return res.status(404).json({ success: false, message: 'Workflow not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
