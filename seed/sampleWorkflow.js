/**
 * Seed Script — uses its own isolated Mongoose connection
 * so it works whether the backend is running or not.
 */
require('dotenv').config({ path: `${__dirname}/../backend/.env` });
const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/halleyx_workflow';

// ─── Inline Schema Definitions (independent of backend models) ─────
const { v4: uuidv4 } = require('uuid');

const WorkflowSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    name: { type: String, required: true },
    version: { type: Number, default: 1 },
    is_active: { type: Boolean, default: true },
    input_schema: { type: mongoose.Schema.Types.Mixed, default: {} },
    start_step_id: { type: String, default: null },
}, { timestamps: true });

const StepSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    workflow_id: { type: String, required: true },
    name: { type: String, required: true },
    step_type: { type: String, enum: ['task', 'approval', 'notification'], required: true },
    order: { type: Number, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

const RuleSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
    step_id: { type: String, required: true },
    condition: { type: String, required: true },
    next_step_id: { type: String, default: null },
    priority: { type: Number, default: 1 },
}, { timestamps: true });

const ExecutionSchema = new mongoose.Schema({
    _id: { type: String, default: uuidv4 },
}, { timestamps: true });

// ─── Run Seed ──────────────────────────────────────────────────────
const seedDB = async () => {
    console.log(`🔌 Connecting to: ${MONGO_URI}`);

    // Create a SEPARATE connection — independent from backend
    const conn = await mongoose.createConnection(MONGO_URI).asPromise();
    console.log('✅ Connected via isolated connection.');

    // Bind models to this specific connection
    const Workflow = conn.model('Workflow', WorkflowSchema);
    const Step = conn.model('Step', StepSchema);
    const Rule = conn.model('Rule', RuleSchema);
    const Execution = conn.model('Execution', ExecutionSchema);

    // 1. Clear ALL existing data
    await Workflow.deleteMany({});
    await Step.deleteMany({});
    await Rule.deleteMany({});
    await Execution.deleteMany({});
    console.log('🗑️  Cleared existing data.');

    // 2. Create Workflow
    const workflow = await Workflow.create({
        name: 'Expense Approval Workflow',
        is_active: true,
        input_schema: {
            amount: { type: 'number', required: true },
            country: { type: 'string', required: true },
            department: { type: 'string', required: false },
            priority: { type: 'string', required: true, allowed_values: ['High', 'Medium', 'Low'] }
        }
    });
    console.log(`📋 Workflow: "${workflow.name}" (${workflow._id})`);

    // 3. Create Steps
    const step1 = await Step.create({ workflow_id: workflow._id, name: 'Manager Approval', step_type: 'approval', order: 1, metadata: { assignee_email: 'manager@example.com' } });
    const step2 = await Step.create({ workflow_id: workflow._id, name: 'Finance Notification', step_type: 'notification', order: 2, metadata: { message: 'Finance review needed', channel: 'email' } });
    const step3 = await Step.create({ workflow_id: workflow._id, name: 'CEO Approval', step_type: 'approval', order: 3, metadata: { assignee_email: 'ceo@example.com' } });
    const step4 = await Step.create({ workflow_id: workflow._id, name: 'Task Completed', step_type: 'task', order: 4, metadata: { action: 'close_ticket' } });
    console.log(`📌 Step 1: "${step1.name}" (${step1._id})`);
    console.log(`📌 Step 2: "${step2.name}" (${step2._id})`);
    console.log(`📌 Step 3: "${step3.name}" (${step3._id})`);
    console.log(`📌 Step 4: "${step4.name}" (${step4._id})`);

    // 4. Set start step
    await Workflow.findByIdAndUpdate(workflow._id, { start_step_id: step1._id });
    console.log(`🚦 Start step → "${step1.name}"`);

    // 5. Rules for Manager Approval
    await Rule.create({ step_id: step1._id, priority: 1, condition: "amount > 100 && country == 'US' && priority == 'High'", next_step_id: step2._id });
    console.log('✅ Rule created: Manager Approval → P1');
    await Rule.create({ step_id: step1._id, priority: 2, condition: "amount > 100", next_step_id: step3._id });
    console.log('✅ Rule created: Manager Approval → P2');
    await Rule.create({ step_id: step1._id, priority: 3, condition: "amount <= 100", next_step_id: step4._id });
    console.log('✅ Rule created: Manager Approval → P3');
    await Rule.create({ step_id: step1._id, priority: 4, condition: "DEFAULT", next_step_id: step4._id });
    console.log('✅ Rule created: Manager Approval → DEFAULT');

    // 6. Terminal rules (next_step_id = null or next step → workflow ends)
    await Rule.create({
        step_id: step2._id,
        condition: 'DEFAULT',
        next_step_id: null,
        priority: 1,
    });
    console.log('✅ Rule created: Finance Notification → DEFAULT → null (workflow ends)');

    await Rule.create({
        step_id: step3._id,
        condition: 'DEFAULT',
        next_step_id: step4._id,
        priority: 1,
    });
    console.log('✅ Rule created: CEO Approval → DEFAULT → Task Completed');

    await Rule.create({
        step_id: step4._id,
        condition: 'DEFAULT',
        next_step_id: null,
        priority: 1,
    });
    console.log('✅ Rule created: Task Completed → DEFAULT → null');

    await conn.close();
    console.log('\n✅ Seed complete! You can now start the backend and use the app.');
    process.exit(0);
};

seedDB().catch(err => {
    console.error('❌ Seed script failed:', err.message);
    process.exit(1);
});
