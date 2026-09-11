import { useState } from 'react';
import { DragDropContext } from '@hello-pangea/dnd';
import { v4 as uuidv4 } from 'uuid';

import { COLUMNS, COLUMN_ORDER, initialTasks, initialUsers } from './data/initialData';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import Column from './components/Column';
import CreateTaskModal from './components/CreateTaskModal';
import AddUserModal from './components/AddUserModal';
import TeamList from './components/TeamList';
import EditTaskModal from './components/EditTaskModal';
import { useWorkload } from './hooks/useWorkload';
import './App.css';

export default function App() {
  // ─── State ───────────────────────────────────────────────
  const [tasks, setTasks]                   = useState(initialTasks);
  const [users, setUsers]                   = useState(initialUsers);
  const [activeFilter, setActiveFilter]     = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserModal, setShowUserModal]   = useState(false);
  const [defaultColumn, setDefaultColumn]   = useState('todo');
  const [editingTask, setEditingTask]       = useState(null);

  // ─── Workload (swap useWorkload for API data when backend is ready) ───
  const workload = useWorkload(users, tasks);

  // ─── Derived: filter tasks ────────────────────────────────
  const filteredTasks = activeFilter === 'all'
    ? tasks
    : tasks.filter(t => t.priority === activeFilter);

  function getColumnTasks(colId) {
    return filteredTasks.filter(t => t.columnId === colId);
  }

  // ─── Task CRUD ────────────────────────────────────────────
  function handleCreateTask(form) {
    const newTask = {
      id: uuidv4(),
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      dueDate: form.dueDate,
      assignees: form.assignees,
      columnId: form.columnId,
    };
    setTasks(prev => [...prev, newTask]);
  }

  function handleDeleteTask(taskId) {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }

  // ─── Edit task ────────────────────────────────────────────
  function handleUpdateTask(updatedTask) {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  }

  // ─── Open "Add Task" from a column button ─────────────────
  function handleAddFromColumn(colId) {
    setDefaultColumn(colId);
    setShowCreateModal(true);
  }

  // ─── Drag & Drop ─────────────────────────────────────────
  function onDragEnd(result) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    // Move task to new column (index-aware reorder within column if same col)
    setTasks(prev => {
      const task = prev.find(t => t.id === draggableId);
      if (!task) return prev;

      // Remove from original position
      const withoutTask = prev.filter(t => t.id !== draggableId);

      // Get tasks of destination column (excluding moved task)
      const destColTasks = withoutTask.filter(t => t.columnId === destination.droppableId);
      const otherTasks   = withoutTask.filter(t => t.columnId !== destination.droppableId);

      const updatedTask = { ...task, columnId: destination.droppableId };

      // Insert at destination index
      destColTasks.splice(destination.index, 0, updatedTask);

      return [...otherTasks, ...destColTasks];
    });
  }

  // ─── User management ─────────────────────────────────────
  function handleAddUser(name) {
    setUsers(prev => [...prev, name]);
  }

  function handleRemoveUser(name) {
    setUsers(prev => prev.filter(u => u !== name));
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
