const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        _id: { type: String, default: uuidv4 },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        plan: { type: String, enum: ['free', 'pro', 'business'], default: 'free' },
        stripeCustomerId: { type: String, default: null },
        stripeSubscriptionId: { type: String, default: null },
        monthlyExecutionCount: { type: Number, default: 0 },
        executionResetDate: { type: Date, default: () => new Date() },
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
        _id: false
    }
);

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

module.exports = mongoose.model('User', userSchema);
