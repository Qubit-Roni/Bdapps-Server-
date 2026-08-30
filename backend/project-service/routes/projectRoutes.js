const express = require('express');
const router = express.Router();
const projectController = require('../controllers/projectController');
const settingsController = require('../controllers/settingsController');
const applicationController = require('../controllers/applicationController');
const contentController = require('../controllers/contentController');

// Settings Routes
router.get('/settings/integration-urls', settingsController.getIntegrationUrls);
router.put('/settings/integration-urls', settingsController.updateIntegrationUrls);

// Application Routes
router.post('/applications', applicationController.createApplication);
router.get('/applications', applicationController.getApplications);
router.get('/applications/by-app-id/:appId', applicationController.getApplicationByAppId);
router.get('/applications/:id', applicationController.getApplication);
router.put('/applications/:id', applicationController.updateApplication);
router.delete('/applications/:id', applicationController.deleteApplication);

// Content Routes
router.get('/contents/notifications', contentController.getNotifications);
router.post('/contents', contentController.createContents);
router.get('/contents', contentController.getContents);
router.put('/contents/:id', contentController.updateContent);
router.delete('/contents/:id', contentController.deleteContent);

// Project Routes
router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);

module.exports = router;
