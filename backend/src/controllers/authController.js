const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Workflow = require('../models/Workflow');
const Step = require('../models/Step');
const Rule = require('../models/Rule');
const { v4: uuidv4 } = require('uuid');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET || 'flowcraft_fallback_secret';
const JWT_EXPIRES = '7d';

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists' });
        }

        const user = new User({ name, email: email.toLowerCase(), password });
        await user.save();

        // Seed a default workflow for onboarding the new user
        try {
            const workflowId = uuidv4();
            const step1Id = uuidv4();
            const step2Id = uuidv4();
            const step3Id = uuidv4();

            const defaultWorkflow = new Workflow({
                _id: workflowId,
                user_id: user._id,
                name: 'E-commerce Order Automation',
                version: 1,
                is_active: true,
                input_schema: { amount: 'number', items: 'number' },
                start_step_id: step1Id
            });
            await defaultWorkflow.save();

            const step1 = new Step({
                _id: step1Id,
                workflow_id: workflowId,
                name: 'Check Order Amount',
                step_type: 'task',
                order: 1,
                metadata: { description: 'Routes orders by size (Threshold: $500)' }
            });
            const step2 = new Step({
                _id: step2Id,
                workflow_id: workflowId,
                name: 'Notify VIP Team (Slack)',
                step_type: 'notification',
                order: 2,
                metadata: { channel: '#vip-orders', message: 'Alert: VIP order placed!' }
            });
            const step3 = new Step({
                _id: step3Id,
                workflow_id: workflowId,
                name: 'Send Invoice Email',
                step_type: 'notification',
                order: 3,
                metadata: { template: 'order_receipt' }
            });

            await Promise.all([step1.save(), step2.save(), step3.save()]);

            const rule1 = new Rule({
                _id: uuidv4(),
                step_id: step1Id,
                condition: 'amount > 500',
                next_step_id: step2Id,
                priority: 1
            });
            const rule2 = new Rule({
                _id: uuidv4(),
                step_id: step1Id,
                condition: 'amount <= 500',
                next_step_id: step3Id,
                priority: 2
            });

            await Promise.all([rule1.save(), rule2.save()]);
        } catch (seedError) {
            console.error('Error seeding default workflow for user:', seedError);
        }

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                user: user.toJSON(),
                token
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: user.toJSON() });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ success: false, message: 'Google ID Token is required' });
        }

        // Verify token authenticity using Google Client ID
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name } = payload;

        if (!email) {
            return res.status(400).json({ success: false, message: 'Email not provided by Google' });
        }

        let user = await User.findOne({ email: email.toLowerCase() });
        let isNewUser = false;

        if (!user) {
            isNewUser = true;
            // Register new user via Google
            user = new User({
                name: name || 'Google User',
                email: email.toLowerCase(),
                password: uuidv4() // Assign random secure password
            });
            await user.save();

            // Seed default onboarding workflow for the Google user
            try {
                const workflowId = uuidv4();
                const step1Id = uuidv4();
                const step2Id = uuidv4();
                const step3Id = uuidv4();

                const defaultWorkflow = new Workflow({
                    _id: workflowId,
                    user_id: user._id,
                    name: 'E-commerce Order Automation',
                    version: 1,
                    is_active: true,
                    input_schema: { amount: 'number', items: 'number' },
                    start_step_id: step1Id
                });
                await defaultWorkflow.save();

                const step1 = new Step({
                    _id: step1Id,
                    workflow_id: workflowId,
                    name: 'Check Order Amount',
                    step_type: 'task',
                    order: 1,
                    metadata: { description: 'Routes orders by size (Threshold: $500)' }
                });
                const step2 = new Step({
                    _id: step2Id,
                    workflow_id: workflowId,
                    name: 'Notify VIP Team (Slack)',
                    step_type: 'notification',
                    order: 2,
                    metadata: { channel: '#vip-orders', message: 'Alert: VIP order placed!' }
                });
                const step3 = new Step({
                    _id: step3Id,
                    workflow_id: workflowId,
                    name: 'Send Invoice Email',
                    step_type: 'notification',
                    order: 3,
                    metadata: { template: 'order_receipt' }
                });

                await Promise.all([step1.save(), step2.save(), step3.save()]);

                const rule1 = new Rule({
                    _id: uuidv4(),
                    step_id: step1Id,
                    condition: 'amount > 500',
                    next_step_id: step2Id,
                    priority: 1
                });
                const rule2 = new Rule({
                    _id: uuidv4(),
                    step_id: step1Id,
                    condition: 'amount <= 500',
                    next_step_id: step3Id,
                    priority: 2
                });

                await Promise.all([rule1.save(), rule2.save()]);
            } catch (seedError) {
                console.error('Error seeding default workflow for Google user:', seedError);
            }
        }

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            data: {
                user: user.toJSON(),
                token,
                isNewUser
            }
        });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Google authentication failed: ' + error.message });
    }
};
