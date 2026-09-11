// In-memory data store — acts as the local "database"
import { v4 as uuidv4 } from 'uuid';

export const COLUMNS = {
  'todo':       { id: 'todo',       title: 'To Do' },
  'inprogress': { id: 'inprogress', title: 'In Progress' },
  'done':       { id: 'done',       title: 'Done' },
};

export const COLUMN_ORDER = ['todo', 'inprogress', 'done'];

export const PRIORITIES = ['low', 'medium', 'high'];

export const initialTasks = [
  {
    id: uuidv4(),
    title: 'Design system architecture',
    description: 'Plan microservices layout and define API contracts for the new platform.',
    priority: 'high',
    dueDate: '2026-09-15',
    assignees: ['Alice', 'Bob'],
    columnId: 'todo',
  },
  {
    id: uuidv4(),
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    priority: 'medium',
    dueDate: '2026-09-20',
    assignees: ['Bob'],
    columnId: 'inprogress',
  },
  {
    id: uuidv4(),
    title: 'Write unit tests for auth module',
    description: 'Cover login, logout, and token refresh flows with Jest.',
    priority: 'high',
    dueDate: '2026-09-18',
    assignees: ['Alice'],
    columnId: 'inprogress',
  },
  {
    id: uuidv4(),
    title: 'Update README documentation',
    description: 'Add setup instructions and contribution guidelines.',
    priority: 'low',
    dueDate: '2026-09-25',
    assignees: [],
    columnId: 'done',
  },
];

export const initialUsers = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve'];
