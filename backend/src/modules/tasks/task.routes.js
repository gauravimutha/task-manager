// src/modules/tasks/task.routes.js
const { Router } = require('express');
const TaskController = require('./task.controller');

// ── Routes mounted at /api/tasks ─────────────────────────────
const taskRouter = Router();

taskRouter.get('/:id',                     TaskController.getById);
taskRouter.put('/:id',                     TaskController.update);
taskRouter.patch('/:id/move',              TaskController.move);
taskRouter.delete('/:id',                  TaskController.delete);
taskRouter.post('/:id/assignees',          TaskController.addAssignee);
taskRouter.delete('/:id/assignees/:userId', TaskController.removeAssignee);

// ── Routes mounted at /api/projects/:projectId/tasks ─────────
const projectTaskRouter = Router({ mergeParams: true });

projectTaskRouter.get('/',   TaskController.getAllByProject);
projectTaskRouter.post('/',  TaskController.create);

module.exports = { taskRouter, projectTaskRouter };
