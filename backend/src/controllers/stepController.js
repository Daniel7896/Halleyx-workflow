/**
 * Step Controller
 * 
 * ARCHITECTURE OVERVIEW:
 * This file manages the "Nodes" (Steps) of our directed graph.
 * When a user drags a new Step onto the canvas, this code saves it to the database
 * and links it to the parent Workflow.
 */
const Step = require('../models/Step');
const Workflow = require('../models/Workflow');

exports.addStep = async (req, res) => {
    try {
        const { workflow_id } = req.params;
        const workflow = await Workflow.findById(workflow_id);
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
        const steps = await Step.find({ workflow_id: req.params.workflow_id }).sort({ order: 1 });
        res.status(200).json({ success: true, data: steps });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateStep = async (req, res) => {
    try {
        const step = await Step.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!step) {
            return res.status(404).json({ success: false, message: 'Step not found' });
        }
        res.status(200).json({ success: true, data: step });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteStep = async (req, res) => {
    try {
        const step = await Step.findByIdAndDelete(req.params.id);
        if (!step) {
            return res.status(404).json({ success: false, message: 'Step not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
