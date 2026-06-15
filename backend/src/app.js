const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const workflowRoutes = require('./routes/workflowRoutes');
const stepRoutes = require('./routes/stepRoutes');
const ruleRoutes = require('./routes/ruleRoutes');
const executionRoutes = require('./routes/executionRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const errorHandler = require('./middleware/errorHandler');
const auth = require('./middleware/auth');

const app = express();

app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check (public)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'FlowCraft API', timestamp: new Date().toISOString() });
});

// Auth routes (public)
app.use('/api/auth', authRoutes);

// Protected routes — require JWT
app.use('/api/workflows', auth, workflowRoutes);
app.use('/api', auth, stepRoutes);
app.use('/api', auth, ruleRoutes);
app.use('/api/executions', auth, executionRoutes);
app.use('/api/analytics', auth, analyticsRoutes);

app.use(errorHandler);

module.exports = app;
