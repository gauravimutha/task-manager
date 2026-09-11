// src/app.js
// Express application setup — mounts all module routes
const express = require('express');
const cors    = require('cors');

const userRoutes    = require('./modules/users/user.routes');
const projectRoutes = require('./modules/projects/project.routes');
const { taskRouter, projectTaskRouter } = require('./modules/tasks/task.routes');
const errorHandler  = require('./middleware/errorHandler');

const app = express();

// ── Global Middleware ─────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json());

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'KanbanFlow API is running' });
});

// ── Module Routes ─────────────────────────────────────────────
app.use('/api/users',    userRoutes);
app.use('/api/projects', projectRoutes);

// Nest task creation + listing under projects
app.use('/api/projects/:projectId/tasks', projectTaskRouter);

// Task CRUD, move, and assignees accessed directly
app.use('/api/tasks', taskRouter);

// ── 404 for unknown routes ────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found` });
});

// ── Centralised error handler (must be last) ──────────────────
app.use(errorHandler);

module.exports = app;
