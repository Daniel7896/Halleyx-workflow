/**
 * Rule Controller
 * 
 * ARCHITECTURE OVERVIEW:
 * This file manages the "Edges" (Rules) of our directed graph.
 * Rules live *inside* a Step, defining where the workflow should go next 
 * if a specific mathematical or logical condition is met by the user's data.
 */
const Rule = require('../models/Rule');
const Step = require('../models/Step');

exports.addRule = async (req, res) => {
    try {
        const { step_id } = req.params;
        const step = await Step.findById(step_id);
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
        const rules = await Rule.find({ step_id: req.params.step_id }).sort({ priority: 1 });
        res.status(200).json({ success: true, data: rules });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateRule = async (req, res) => {
    try {
        const rule = await Rule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!rule) {
            return res.status(404).json({ success: false, message: 'Rule not found' });
        }
        res.status(200).json({ success: true, data: rule });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

exports.deleteRule = async (req, res) => {
    try {
        const rule = await Rule.findByIdAndDelete(req.params.id);
        if (!rule) {
            return res.status(404).json({ success: false, message: 'Rule not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
