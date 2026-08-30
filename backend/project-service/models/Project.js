const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    developerId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    framework: {
        type: String,
        enum: ['nodejs', 'laravel', 'php', 'react', 'nextjs', 'static'],
        required: true
    },
    domainName: {
        type: String,
        unique: true,
        sparse: true
    },
    status: {
        type: String,
        enum: ['draft', 'deploying', 'running', 'stopped', 'failed'],
        default: 'draft'
    },
    envVars: {
        type: Map,
        of: String
    }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
