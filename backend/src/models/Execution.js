const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const logEntrySchema = new mongoose.Schema({
    step_id: { type: String },
    step_name: { type: String },
    step_type: { type: String },
    evaluated_rules: [
        {
            rule_id: { type: String },
            condition: { type: String },
            result: { type: Boolean }
        }
    ],
    matched_rule_id: { type: String, default: null },
    selected_next_step: { type: String, default: null },
    status: { type: String, enum: ['completed', 'failed', 'skipped'] },
    started_at: { type: Date },
    ended_at: { type: Date },
    error: { type: String, default: null }
}, { _id: false });

const executionSchema = new mongoose.Schema(
    {
        _id: { type: String, default: uuidv4 },
        workflow_id: { type: String, ref: 'Workflow', required: true },
        workflow_version: { type: Number, required: true },
        status: {
            type: String,
            enum: ['pending', 'in_progress', 'completed', 'failed', 'canceled'],
            default: 'pending'
        },
        data: { type: mongoose.Schema.Types.Mixed, default: {} },
        logs: [logEntrySchema],
        current_step_id: { type: String, ref: 'Step', default: null },
        retries: { type: Number, default: 0 },
        triggered_by: { type: String, default: 'system' },
        started_at: { type: Date },
        ended_at: { type: Date }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        _id: false
    }
);

module.exports = mongoose.model('Execution', executionSchema);
