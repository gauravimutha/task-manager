-- ============================================================
-- KanbanFlow Database Schema
-- Run once: psql -U postgres -d kanbanflow -f schema.sql
-- ============================================================

-- Drop in dependency order (re-runnable)
DROP TABLE IF EXISTS task_assignees   CASCADE;
DROP TABLE IF EXISTS tasks            CASCADE;
DROP TABLE IF EXISTS project_members  CASCADE;
DROP TABLE IF EXISTS projects         CASCADE;
DROP TABLE IF EXISTS users            CASCADE;

-- ------------------------------------------------------------
-- USERS
-- ------------------------------------------------------------
CREATE TABLE users (
  id         SERIAL PRIMARY KEY,
  name       VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- PROJECTS  (one Kanban board per project)
-- ------------------------------------------------------------
CREATE TABLE projects (
  id          SERIAL PRIMARY KEY,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ------------------------------------------------------------
-- PROJECT_MEMBERS  (users <-> projects, with role)
-- ------------------------------------------------------------
CREATE TABLE project_members (
  id         SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  role       VARCHAR(20) NOT NULL DEFAULT 'member'
               CHECK (role IN ('owner', 'member')),
  joined_at  TIMESTAMP DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

-- ------------------------------------------------------------
-- TASKS  (belong to a project, have status = Kanban column)
-- ------------------------------------------------------------
CREATE TABLE tasks (
  id          SERIAL PRIMARY KEY,
  project_id  INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title       VARCHAR(300) NOT NULL,
  description TEXT,
  priority    VARCHAR(10) NOT NULL DEFAULT 'medium'
                CHECK (priority IN ('low', 'medium', 'high')),
  status      VARCHAR(20) NOT NULL DEFAULT 'todo'
                CHECK (status IN ('todo', 'inprogress', 'done')),
  due_date    DATE,
  position    INTEGER NOT NULL DEFAULT 0,  -- ordering within a column
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ------------------------------------------------------------
-- TASK_ASSIGNEES  (tasks <-> users)
-- ------------------------------------------------------------
CREATE TABLE task_assignees (
  task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);

-- ------------------------------------------------------------
-- Seed data (optional demo content)
-- ------------------------------------------------------------
INSERT INTO users (name, email) VALUES
  ('Alice',   'alice@example.com'),
  ('Bob',     'bob@example.com'),
  ('Charlie', 'charlie@example.com');

INSERT INTO projects (title, description) VALUES
  ('KanbanFlow Demo', 'Default project created on first run.');

INSERT INTO project_members (project_id, user_id, role) VALUES
  (1, 1, 'owner'),
  (1, 2, 'member'),
  (1, 3, 'member');

INSERT INTO tasks (project_id, title, description, priority, status, due_date, position) VALUES
  (1, 'Design system architecture',  'Plan microservices layout.',          'high',   'todo',       '2026-09-15', 0),
  (1, 'Set up CI/CD pipeline',       'Configure GitHub Actions.',           'medium', 'inprogress', '2026-09-20', 0),
  (1, 'Write unit tests for auth',   'Cover login, logout, token refresh.', 'high',   'inprogress', '2026-09-18', 1),
  (1, 'Update README documentation', 'Add setup and contribution guide.',   'low',    'done',       '2026-09-25', 0);

INSERT INTO task_assignees (task_id, user_id) VALUES
  (1, 1), (1, 2),
  (2, 2),
  (3, 1),
  (4, 3);
