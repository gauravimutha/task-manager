import { useState, useEffect, useCallback } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';

import { COLUMNS, COLUMN_ORDER } from './data/initialData';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import Column from './components/Column';
import CreateTaskModal from './components/CreateTaskModal';
import AddUserModal from './components/AddUserModal';
import TeamList from './components/TeamList';
import EditTaskModal from './components/EditTaskModal';
import { useWorkload } from './hooks/useWorkload';
import { api } from './services/api';
import './App.css';

function transformTaskFromBackend(t) {
  return {
    id: String(t.id),
    title: t.title,
    description: t.description || '',
    priority: t.priority || 'medium',
    dueDate: t.due_date ? t.due_date.split('T')[0] : '',
    columnId: t.status,
    assignees: (t.assignees || []).map(a => (typeof a === 'string' ? a : a.name)),
    rawAssignees: t.assignees || [],
    position: t.position || 0,
  };
}

export default function App() {
  // ─── State ───────────────────────────────────────────────
  const [tasks, setTasks]                     = useState([]);
  const [userObjects, setUserObjects]         = useState([]);
  const [users, setUsers]                     = useState([]);
  const [activeFilter, setActiveFilter]       = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal]     = useState(false);
  const [defaultColumn, setDefaultColumn]     = useState('todo');
  const [editingTask, setEditingTask]         = useState(null);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState(null);

  const projectId = 1; // Default project (KanbanFlow Demo)

  // ─── Fetch Data from Backend API ─────────────────────────
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, tasksData] = await Promise.all([
        api.getUsers(),
        api.getTasks(projectId),
      ]);

      setUserObjects(usersData);
      setUsers(usersData.map(u => u.name));
      setTasks(tasksData.map(transformTaskFromBackend));
    } catch (err) {
      console.error('Failed to load data from backend:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ─── Workload ─────────────────────────────────────────────
  const workload = useWorkload(users, tasks);

  // ─── Derived: filter tasks ────────────────────────────────
  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter(t => t.priority === activeFilter);

  function getColumnTasks(colId) {
    return filteredTasks.filter(t => t.columnId === colId);
  }

  // ─── Task CRUD ────────────────────────────────────────────
  async function handleCreateTask(form) {
    try {
      // 1. Create task in DB
      const created = await api.createTask(projectId, {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        status: form.columnId,
        due_date: form.dueDate || null,
        position: tasks.filter(t => t.columnId === form.columnId).length,
      });

      // 2. Associate assignees
      if (form.assignees && form.assignees.length > 0) {
        for (const assigneeName of form.assignees) {
          let userObj = userObjects.find(u => u.name.toLowerCase() === assigneeName.toLowerCase());
          if (!userObj) {
            // Auto-create user if entered as a new name
            const emailSlug = assigneeName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
            userObj = await api.createUser({
              name: assigneeName,
              email: `${emailSlug}_${Date.now()}@example.com`,
            });
            setUserObjects(prev => [...prev, userObj]);
            setUsers(prev => [...prev, userObj.name]);
          }
          await api.addAssignee(created.id, userObj.id);
        }
      }

      // 3. Refresh live tasks to get full DB state with relations
      const freshTasks = await api.getTasks(projectId);
      setTasks(freshTasks.map(transformTaskFromBackend));
    } catch (err) {
      console.error('Error creating task:', err);
      alert(`Failed to create task: ${err.message}`);
    }
  }

  async function handleDeleteTask(taskId) {
    // Optimistic delete
    const previousTasks = [...tasks];
    setTasks(prev => prev.filter(t => t.id !== taskId));

    try {
      await api.deleteTask(taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
      setTasks(previousTasks); // Rollback
      alert(`Failed to delete task: ${err.message}`);
    }
  }

  async function handleUpdateTask(updatedTask) {
    const previousTasks = [...tasks];
    // Optimistic update
    setTasks(prev => prev.map(t => (t.id === updatedTask.id ? updatedTask : t)));

    try {
      await api.updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        status: updatedTask.columnId,
        due_date: updatedTask.dueDate || null,
      });

      // Synchronize assignees
      const existingAssigneeNames = (updatedTask.rawAssignees || []).map(a => a.name);
      const newAssigneeNames = updatedTask.assignees || [];

      // Add newly assigned
      for (const name of newAssigneeNames) {
        if (!existingAssigneeNames.includes(name)) {
          let uObj = userObjects.find(u => u.name.toLowerCase() === name.toLowerCase());
          if (!uObj) {
            const emailSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
            uObj = await api.createUser({ name, email: `${emailSlug}_${Date.now()}@example.com` });
            setUserObjects(prev => [...prev, uObj]);
            setUsers(prev => [...prev, uObj.name]);
          }
          await api.addAssignee(updatedTask.id, uObj.id);
        }
      }

      // Remove unassigned
      for (const rawA of updatedTask.rawAssignees || []) {
        if (!newAssigneeNames.includes(rawA.name)) {
          await api.removeAssignee(updatedTask.id, rawA.id);
        }
      }

      // Refresh tasks
      const freshTasks = await api.getTasks(projectId);
      setTasks(freshTasks.map(transformTaskFromBackend));
    } catch (err) {
      console.error('Error updating task:', err);
      setTasks(previousTasks);
      alert(`Failed to update task: ${err.message}`);
    }
  }

  function handleAddFromColumn(colId) {
    setDefaultColumn(colId);
    setShowCreateModal(true);
  }

  // ─── Drag & Drop ─────────────────────────────────────────
  async function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const previousTasks = [...tasks];

    // Optimistic UI update
    setTasks(prev => {
      const task = prev.find(t => t.id === draggableId);
      if (!task) return prev;

      const withoutTask = prev.filter(t => t.id !== draggableId);
      const destColTasks = withoutTask.filter(t => t.columnId === destination.droppableId);
      const otherTasks   = withoutTask.filter(t => t.columnId !== destination.droppableId);

      const updatedTask = { ...task, columnId: destination.droppableId };
      destColTasks.splice(destination.index, 0, updatedTask);

      return [...otherTasks, ...destColTasks];
    });

    try {
      await api.moveTask(draggableId, {
        status: destination.droppableId,
        position: destination.index,
      });
    } catch (err) {
      console.error('Error moving task:', err);
      setTasks(previousTasks); // Rollback
      alert(`Failed to move task: ${err.message}`);
    }
  }

  // ─── User management ─────────────────────────────────────
  async function handleAddUser(name) {
    try {
      const emailSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      const createdUser = await api.createUser({
        name,
        email: `${emailSlug}_${Date.now()}@example.com`,
      });
      setUserObjects(prev => [...prev, createdUser]);
      setUsers(prev => [...prev, createdUser.name]);
    } catch (err) {
      console.error('Error adding user:', err);
      alert(`Failed to add user: ${err.message}`);
    }
  }

  async function handleRemoveUser(name) {
    const uObj = userObjects.find(u => u.name === name);
    if (!uObj) {
      setUsers(prev => prev.filter(u => u !== name));
      return;
    }

    try {
      await api.deleteUser(uObj.id);
      setUserObjects(prev => prev.filter(u => u.id !== uObj.id));
      setUsers(prev => prev.filter(u => u !== name));
      // Refresh tasks in case this user was assigned to any
      const freshTasks = await api.getTasks(projectId);
      setTasks(freshTasks.map(transformTaskFromBackend));
    } catch (err) {
      console.error('Error removing user:', err);
      alert(`Failed to remove user: ${err.message}`);
    }
  }

  return (
    <div className="app">
      <Header
        onCreateTask={() => { setDefaultColumn('todo'); setShowCreateModal(true); }}
        onAddUser={() => setShowUserModal(true)}
      />

      <FilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        taskCount={filteredTasks.length}
      />

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px', color: '#8892b0' }}>
          <p>Loading board from database...</p>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#ff6b6b' }}>
          <p>Error connecting to backend: {error}</p>
          <button
            onClick={fetchData}
            style={{
              marginTop: '12px',
              padding: '8px 16px',
              background: '#6c63ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="main-layout">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="board-area">
              {COLUMN_ORDER.map(colId => (
                <Column
                  key={colId}
                  column={COLUMNS[colId]}
                  tasks={getColumnTasks(colId)}
                  onDeleteTask={handleDeleteTask}
                  onEditTask={setEditingTask}
                  onAddTask={handleAddFromColumn}
                />
              ))}
            </div>
          </DragDropContext>

          <TeamList workload={workload} />
        </div>
      )}

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          users={users}
          onClose={() => setEditingTask(null)}
          onSubmit={handleUpdateTask}
        />
      )}

      {showCreateModal && (
        <CreateTaskModal
          users={users}
          defaultColumn={defaultColumn}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTask}
        />
      )}

      {showUserModal && (
        <AddUserModal
          users={users}
          onClose={() => setShowUserModal(false)}
          onAddUser={handleAddUser}
          onRemoveUser={handleRemoveUser}
        />
      )}
    </div>
  );
}
