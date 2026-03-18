const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const Execution = require('../models/Execution');
const { evaluateRules } = require('./ruleEngine');

/**
 * HalleyX Core Execution Engine
 * 
 * ARCHITECTURE OVERVIEW:
 * We model workflows as a mathematical "Directed Graph" where:
 *   - Nodes = Steps
 *   - Edges = Rules (connecting one Step to another)
 * 
 * This engine acts as a "State Machine" that traverses the graph. 
 * Starting at the `start_step_id`, it evaluates rules to figure out 
 * which path to take. Because it relies purely on data relationships (IDs)
 * rather than hardcoded Logic, users can build INFINITE combinations of 
 * workflows entirely from the UI without writing new code!
 */

// ─── Input Validation ──────────────────────────────────────────────
const validateInputData = (schema, data) => {
    if (!schema || Object.keys(schema).length === 0) return;
    for (const [key, fieldDef] of Object.entries(schema)) {
        const value = data[key];
        if (fieldDef.required && (value === undefined || value === null || value === '')) {
            throw new Error(`Validation Error: "${key}" is required`);
        }
        if (value !== undefined && value !== null && value !== '') {
            if (typeof value !== fieldDef.type) {
                throw new Error(`Validation Error: "${key}" must be of type ${fieldDef.type}`);
            }
            if (fieldDef.allowed_values && fieldDef.allowed_values.length > 0) {
                if (!fieldDef.allowed_values.includes(value)) {
                    throw new Error(`Validation Error: "${key}" must be one of: ${fieldDef.allowed_values.join(', ')}`);
                }
            }
        }
    }
};

/**
 * Core Execution Loop (The Graph Walker)
 * 
 * Takes an Execution ID and a starting point, and walks through the steps 
 * until it hits a dead end (null) or errors out.
 */
async function runEngineLoop(execution, startStepId, inputData) {
    let currentStepId = startStepId;

    while (currentStepId) {
        const step = await Step.findById(currentStepId);
        if (!step) throw new Error(`Step "${currentStepId}" not found`);

        const rules = await Rule.find({ step_id: currentStepId }).sort({ priority: 1 });
        const stepStartTime = new Date();
        const { matchedRule, evaluatedRules } = evaluateRules(rules, inputData);

        const logEntry = {
            step_id: step._id,
            step_name: step.name,
            step_type: step.step_type,
            evaluated_rules: evaluatedRules,
            matched_rule_id: matchedRule ? matchedRule._id : null,
            selected_next_step: matchedRule ? matchedRule.next_step_id : null,
            status: matchedRule ? 'completed' : 'failed',
            started_at: stepStartTime,
            ended_at: new Date(),
            error: matchedRule ? null : 'No matching rule found for this step',
        };

        execution.logs.push(logEntry);

        if (!matchedRule) {
            throw new Error(`No matching rule found for step: "${step.name}"`);
        }

        // FIX: Explicit termination when next_step_id is null
        if (!matchedRule.next_step_id) {
            execution.current_step_id = null;
            execution.status = 'completed';
            execution.ended_at = new Date(); // FIX 4: set ended_at on completion
            await execution.save();
            return;
        }

        currentStepId = matchedRule.next_step_id;
        execution.current_step_id = currentStepId;
        await execution.save();
    }

    // Fallback: if loop exits normally with null
    execution.status = 'completed';
    execution.ended_at = new Date();
    await execution.save();
}

/**
 * API Entry Point: Launch a new Workflow execution.
 * 
 * @param {string} workflowId - The workflow being run
 * @param {object} inputData - JSON from the frontend
 * @param {string} triggeredBy - Audit field (e.g. 'system', 'user_id')
 */
const executeWorkflow = async (workflowId, inputData, triggeredBy = 'system') => {
    const workflow = await Workflow.findById(workflowId);
    if (!workflow) throw new Error('Workflow not found');
    if (!workflow.is_active) throw new Error('Workflow is not active');

    validateInputData(workflow.input_schema, inputData);

    // FIX 4: started_at set explicitly at launch
    const execution = new Execution({
        workflow_id: workflow._id,
        workflow_version: workflow.version,
        status: 'in_progress',
        data: inputData,
        logs: [],
        current_step_id: workflow.start_step_id,
        triggered_by: triggeredBy,
        started_at: new Date(),
    });
    await execution.save();

    try {
        await runEngineLoop(execution, workflow.start_step_id, inputData);
    } catch (error) {
        execution.status = 'failed';
        execution.ended_at = new Date(); // FIX 4: set ended_at on failure
        if (execution.logs.length > 0) {
            const last = execution.logs[execution.logs.length - 1];
            last.status = 'failed';
            last.error = error.message;
            last.ended_at = new Date();
        } else {
            execution.logs.push({
                step_id: 'unknown',
                step_name: 'Initialization',
                step_type: 'system',
                evaluated_rules: [],
                status: 'failed',
                started_at: new Date(),
                ended_at: new Date(),
                error: error.message,
            });
        }
        await execution.save();
        throw error;
    }

    return execution;
};

// ─── Cancel Execution ──────────────────────────────────────────────
const cancelExecution = async (executionId) => {
    const execution = await Execution.findById(executionId);
    if (!execution) throw new Error('Execution not found');

    // FIX 3: Only cancel if in_progress or pending; error otherwise
    if (execution.status !== 'in_progress' && execution.status !== 'pending') {
        throw new Error(`Cannot cancel an execution with status: ${execution.status}`);
    }

    execution.status = 'canceled';
    execution.ended_at = new Date(); // FIX 4
    await execution.save();
    return execution;
};

/**
 * API Entry Point: Resume a failed workflow.
 * 
 * WHY RETRIES ARE HARD:
 * If a workflow with 10 steps fails at step 9, we shouldn't re-run steps 1-8. 
 * This function smartly finds the exact point of failure, trims the corrupt logs, 
 * and resumes gracefully from step 9 using the original input data.
 */
const retryExecution = async (executionId) => {
    const execution = await Execution.findById(executionId);
    if (!execution) throw new Error('Execution not found');
    if (execution.status !== 'failed') throw new Error('Only failed executions can be retried');

    // FIX 2: Find the LAST log entry with status = "failed"
    let failedLogIndex = -1;
    for (let i = execution.logs.length - 1; i >= 0; i--) {
        if (execution.logs[i].status === 'failed') {
            failedLogIndex = i;
            break;
        }
    }

    // Trim logs to only keep successfully completed ones (before the failed step)
    if (failedLogIndex >= 0) {
        execution.logs = execution.logs.slice(0, failedLogIndex);
    }

    const retryStepId = execution.current_step_id;
    if (!retryStepId) throw new Error('No current step to retry from');

    // FIX 2: Increment retries, reset status
    execution.retries = (execution.retries || 0) + 1;
    execution.status = 'in_progress';
    execution.ended_at = undefined;
    await execution.save();

    try {
        await runEngineLoop(execution, retryStepId, execution.data);
    } catch (error) {
        execution.status = 'failed';
        execution.ended_at = new Date();
        if (execution.logs.length > 0) {
            const last = execution.logs[execution.logs.length - 1];
            last.status = 'failed';
            last.error = error.message;
            last.ended_at = new Date();
        }
        await execution.save();
        throw error;
    }

    return execution;
};

module.exports = { executeWorkflow, cancelExecution, retryExecution };
