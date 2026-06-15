/**
 * Plan configuration for FlowCraft SaaS tiers.
 * Defines limits for each subscription plan.
 */
const PLANS = {
    free: {
        name: 'Free',
        price: 0,
        maxWorkflows: 3,
        maxExecutionsPerMonth: 100,
        maxStepsPerWorkflow: 5,
        executionHistoryDays: 7,
        apiAccess: false,
        prioritySupport: false,
    },
    pro: {
        name: 'Pro',
        price: 19,
        maxWorkflows: 25,
        maxExecutionsPerMonth: 5000,
        maxStepsPerWorkflow: 20,
        executionHistoryDays: 30,
        apiAccess: true,
        prioritySupport: true,
    },
    business: {
        name: 'Business',
        price: 49,
        maxWorkflows: Infinity,
        maxExecutionsPerMonth: Infinity,
        maxStepsPerWorkflow: Infinity,
        executionHistoryDays: 90,
        apiAccess: true,
        prioritySupport: true,
    },
};

const getPlanLimits = (planName) => {
    return PLANS[planName] || PLANS.free;
};

module.exports = { PLANS, getPlanLimits };
