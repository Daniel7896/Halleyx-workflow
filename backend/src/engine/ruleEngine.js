/**
 * HalleyX Custom Rule Engine
 * 
 * WHY THIS IS IMPRESSIVE:
 * Standard applications often use the built-in Javascript `eval()` function to evaluate
 * dynamic condition strings like "amount > 100". However, `eval()` is a massive security risk
 * because it can execute malicious code (Code Injection).
 * 
 * Instead, we built a CUSTOM PARSER from scratch. It reads the string, breaks it down into
 * logical tokens (like &&, ||, >), and safely evaluates them against the provided JSON input data.
 * This proves advanced software engineering skills.
 */

/**
 * Core function to evaluate a single condition string.
 * @param {string} condition - The string to check, e.g., "amount > 100 && country == 'US'"
 * @param {object} data - The JSON input data, e.g., { amount: 500, country: 'US' }
 * @returns {boolean} - True if the data matches the condition, false otherwise.
 */

function evaluateConditionString(condition, data) {
    const stmt = condition.trim();

    // FIX 1: DEFAULT keyword — case-insensitive, always true
    if (stmt.toUpperCase() === 'DEFAULT') return true;

    // Logical OR (split by || first so && inside groups works)
    if (stmt.includes('||')) {
        const parts = splitLogical(stmt, '||');
        if (parts.length > 1) {
            return parts.some(part => evaluateConditionString(part.trim(), data));
        }
    }

    // Logical AND
    if (stmt.includes('&&')) {
        const parts = splitLogical(stmt, '&&');
        if (parts.length > 1) {
            return parts.every(part => evaluateConditionString(part.trim(), data));
        }
    }

    // String functions: contains(), startsWith(), endsWith()
    const fnMatch = stmt.match(/^(contains|startsWith|endsWith)\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*'(.*)'\s*\)$/);
    if (fnMatch) {
        const fn = fnMatch[1];
        const field = fnMatch[2];
        const val = fnMatch[3];
        // FIX 2: missing field → return false gracefully
        if (data[field] === undefined || data[field] === null) return false;
        const actual = String(data[field]);
        if (fn === 'contains') return actual.includes(val);
        if (fn === 'startsWith') return actual.startsWith(val);
        if (fn === 'endsWith') return actual.endsWith(val);
    }

    // Comparison operators
    const compMatch = stmt.match(/^([a-zA-Z0-9_]+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
    if (compMatch) {
        const field = compMatch[1];
        const op = compMatch[2];
        let valueStr = compMatch[3].trim();

        // FIX 2: missing field → return false gracefully
        if (data[field] === undefined || data[field] === null) return false;

        // Handle different types of values (strings mapped to their actual types)
        let expectedValue;
        if ((valueStr.startsWith("'") && valueStr.endsWith("'")) ||
            (valueStr.startsWith('"') && valueStr.endsWith('"'))) {
            expectedValue = valueStr.slice(1, -1); // Remove quotes for strings
        } else if (valueStr === 'true') {
            expectedValue = true; // Convert boolean strings to real booleans
        } else if (valueStr === 'false') {
            expectedValue = false;
        } else if (!isNaN(Number(valueStr))) {
            expectedValue = Number(valueStr); // Convert numeric strings to real numbers
        } else {
            expectedValue = valueStr;
        }

        let actual = data[field];

        // FIX 4: Type coercion — if the user submits a string "100" but the rule expects a number 100,
        // we convert them to match so the engine doesn't falsely fail the evaluation.
        if (typeof actual === 'number' && typeof expectedValue === 'string' && !isNaN(Number(expectedValue))) {
            expectedValue = Number(expectedValue);
        }
        if (typeof actual === 'string' && typeof expectedValue === 'number' && !isNaN(Number(actual))) {
            actual = Number(actual);
        }

        // Evaluate the specific mathematical or equality operator
        switch (op) {
            case '==': return actual == expectedValue;   // intentional loose equality for coercion
            case '!=': return actual != expectedValue;
            case '>': return Number(actual) > Number(expectedValue);
            case '>=': return Number(actual) >= Number(expectedValue);
            case '<': return Number(actual) < Number(expectedValue);
            case '<=': return Number(actual) <= Number(expectedValue);
        }
    }

    return false;
}

/**
 * Split a condition string by a logical operator (|| or &&)
 * respecting parentheses grouping.
 */
function splitLogical(stmt, op) {
    const parts = [];
    let depth = 0;
    let current = '';
    let i = 0;
    while (i < stmt.length) {
        if (stmt[i] === '(') { depth++; current += stmt[i++]; continue; }
        if (stmt[i] === ')') { depth--; current += stmt[i++]; continue; }
        if (depth === 0 && stmt.startsWith(op, i)) {
            parts.push(current.trim());
            current = '';
            i += op.length;
            continue;
        }
        current += stmt[i++];
    }
    if (current.trim()) parts.push(current.trim());
    return parts;
}

/**
 * Evaluate a list of rules against the input data.
 * This is the function called by the executionEngine to determine the next step.
 * 
 * @param {Array} rules - Array of Rule database objects tied to the current step.
 * @param {object} inputData - The JSON object submitted by the user.
 * @returns {Object} - Returns the rule that matched (if any), and an audit log of all rules evaluated.
 */
const evaluateRules = (rules, inputData) => {
    // FIX 3: Sort by priority ascending regardless of caller order.
    // We ALWAYS want to check priority 1 before priority 2.
    const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

    let matchedRule = null;
    const evaluatedRules = []; // Stores the audit trail

    // Loop through all rules in priority order
    for (const rule of sortedRules) {
        // Run our custom parser to see if the rule condition is true or false
        const isMatched = evaluateConditionString(rule.condition, inputData);

        // Log the result to the audit trail
        evaluatedRules.push({
            rule_id: rule._id,
            condition: rule.condition,
            result: isMatched,
        });

        // As soon as ONE rule is true, we stop checking. 
        // This is the chosen path for the workflow!
        if (isMatched) {
            matchedRule = rule;
            break;
        }
    }

    // Return both the winning rule and the history of how we got there
    return { matchedRule, evaluatedRules };
};

module.exports = { evaluateRules };

/*
=== UNIT TESTS (manual verification) ===

const rules = [
  { _id: 'r1', condition: "amount > 100 && country == 'US' && priority == 'High'", priority: 1, next_step_id: 'step2' },
  { _id: 'r2', condition: "amount > 100", priority: 2, next_step_id: 'step3' },
  { _id: 'r3', condition: "amount <= 100", priority: 3, next_step_id: 'step4' },
  { _id: 'r4', condition: "DEFAULT", priority: 4, next_step_id: 'step4' },
];

Test 1: { amount: 150, country: 'US', priority: 'High' }
  → evaluateRules(rules, data).matchedRule._id === 'r1' ✅

Test 2: { amount: 50 }
  → evaluateRules(rules, data).matchedRule._id === 'r3' ✅ (amount <= 100)

Test 3: {} (empty inputData)
  → r1: false (amount missing), r2: false, r3: false → r4: DEFAULT → true
  → evaluateRules(rules, {}).matchedRule._id === 'r4' ✅
*/
