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
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175'
];

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // check if origin is in whitelist or is localhost
        const isAllowed = allowedOrigins.includes(origin) || 
                          origin.startsWith('http://localhost:') || 
                          origin.startsWith('http://127.0.0.1:') || 
                          origin === process.env.FRONTEND_URL;
                          
        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
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
