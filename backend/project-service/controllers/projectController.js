const Project = require('../models/Project');

exports.createProject = async (req, res) => {
    try {
        const { name, framework, envVars } = req.body;
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const project = await Project.create({
            developerId,
            name,
            framework,
            envVars
        });

        res.status(201).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.getProjects = async (req, res) => {
    try {
        const developerId = req.headers['x-user-id'];
        if (!developerId) return res.status(401).json({ success: false, message: 'Unauthorized' });
        
        const projects = await Project.find({ developerId });

        res.status(200).json({ success: true, count: projects.length, projects });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }

        res.status(200).json({ success: true, project });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
