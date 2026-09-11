// src/modules/projects/project.routes.js
const { Router } = require('express');
const ProjectController = require('./project.controller');

const router = Router();

// Project CRUD
router.get('/',    ProjectController.getAll);
router.post('/',   ProjectController.create);
router.get('/:id', ProjectController.getById);
router.put('/:id', ProjectController.update);
router.delete('/:id', ProjectController.delete);

// Project membership
router.get('/:id/members',               ProjectController.getMembers);
router.post('/:id/members',              ProjectController.addMember);
router.delete('/:id/members/:userId',    ProjectController.removeMember);

module.exports = router;
