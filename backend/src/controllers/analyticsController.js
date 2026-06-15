/**
 * Analytics Controller
 * Provides dashboard statistics for the authenticated user.
 */
const Workflow = require('../models/Workflow');
const Execution = require('../models/Execution');
const User = require('../models/User');
const { getPlanLimits } = require('../config/plans');

exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        const [
            totalWorkflows,
            activeWorkflows,
            totalExecutions,
            completedExecutions,
            failedExecutions,
            recentExecutions
        ] = await Promise.all([
            Workflow.countDocuments({ user_id: userId }),
            Workflow.countDocuments({ user_id: userId, is_active: true }),
            Execution.countDocuments({ user_id: userId }),
            Execution.countDocuments({ user_id: userId, status: 'completed' }),
            Execution.countDocuments({ user_id: userId, status: 'failed' }),
            Execution.find({ user_id: userId })
                .sort({ created_at: -1 })
                .limit(10)
                .select('_id workflow_id status started_at ended_at workflow_version')
                .lean()
        ]);

        const successRate = totalExecutions > 0
            ? Math.round((completedExecutions / totalExecutions) * 100)
            : 0;

        const limits = getPlanLimits(user?.plan || 'free');

        // Get workflow names for recent executions
        const workflowIds = [...new Set(recentExecutions.map(e => e.workflow_id))];
        const workflows = await Workflow.find({ _id: { $in: workflowIds } }).select('_id name').lean();
        const workflowMap = {};
        workflows.forEach(w => { workflowMap[w._id] = w.name; });

        const enrichedExecutions = recentExecutions.map(e => ({
            ...e,
            workflow_name: workflowMap[e.workflow_id] || 'Deleted Workflow'
        }));

        // Get 7-day history trend
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const historyExecutions = await Execution.find({
            user_id: userId,
            created_at: { $gte: sevenDaysAgo }
        }).select('created_at').lean();

        const dailyCounts = {};
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dailyCounts[dateStr] = 0;
        }

        historyExecutions.forEach(e => {
            if (e.created_at) {
                const dateStr = new Date(e.created_at).toISOString().split('T')[0];
                if (dailyCounts[dateStr] !== undefined) {
                    dailyCounts[dateStr]++;
                }
            }
        });

        const executionTrend = Object.keys(dailyCounts).map(date => ({
            date,
            count: dailyCounts[date]
        }));

        res.status(200).json({
            success: true,
            data: {
                stats: {
                    totalWorkflows,
                    activeWorkflows,
                    totalExecutions,
                    completedExecutions,
                    failedExecutions,
                    successRate,
                    monthlyExecutions: user?.monthlyExecutionCount || 0,
                    executionTrend
                },
                plan: {
                    name: user?.plan || 'free',
                    limits
                },
                recentExecutions: enrichedExecutions
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
