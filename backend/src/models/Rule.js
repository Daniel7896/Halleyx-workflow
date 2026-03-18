const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const ruleSchema = new mongoose.Schema(
    {
        _id: { type: String, default: uuidv4 },
        step_id: { type: String, ref: 'Step', required: true },
        condition: { type: String, required: true },
        next_step_id: { type: String, ref: 'Step', default: null },
        priority: { type: Number, required: true }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        _id: false
    }
);

ruleSchema.index({ step_id: 1, priority: 1 });

module.exports = mongoose.model('Rule', ruleSchema);
