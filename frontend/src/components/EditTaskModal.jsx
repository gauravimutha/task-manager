import { useState } from 'react';
/* Reuse CreateTaskModal styles — same form structure */
import './CreateTaskModal.css';

export default function EditTaskModal({ task, users, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title:       task.title,
    description: task.description,
    priority:    task.priority,
    dueDate:     task.dueDate,
    columnId:    task.columnId,
    assignees:   [...(task.assignees || [])],
  });
  const [newAssignee, setNewAssignee] = useState('');

  function handle(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function toggleAssignee(user) {
    setForm(f => ({
      ...f,
      assignees: f.assignees.includes(user)
        ? f.assignees.filter(a => a !== user)
        : [...f.assignees, user],
    }));
  }

  function addNewAssignee() {
    const name = newAssignee.trim();
    if (!name || form.assignees.includes(name)) return;
    setForm(f => ({ ...f, assignees: [...f.assignees, name] }));
    setNewAssignee('');
  }

  function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit({ ...task, ...form, title: form.title.trim(), description: form.description.trim() });
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <p className="modal__title">Edit Task</p>
        <form onSubmit={submit}>

          <div className="modal__field">
            <label className="modal__label">Title *</label>
            <input
              className="modal__input"
              name="title"
              value={form.title}
              onChange={handle}
              placeholder="Task title..."
              autoFocus
              required
            />
          </div>

          <div className="modal__field">
            <label className="modal__label">Description</label>
            <textarea
              className="modal__textarea"
              name="description"
              value={form.description}
              onChange={handle}
              placeholder="Optional details..."
            />
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="modal__field" style={{ flex: 1 }}>
              <label className="modal__label">Priority</label>
              <select className="modal__select" name="priority" value={form.priority} onChange={handle}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="modal__field" style={{ flex: 1 }}>
              <label className="modal__label">Column</label>
              <select className="modal__select" name="columnId" value={form.columnId} onChange={handle}>
                <option value="todo">To Do</option>
                <option value="inprogress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="modal__field">
            <label className="modal__label">Due Date</label>
            <input
              className="modal__input"
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handle}
            />
          </div>

          {users.length > 0 && (
            <div className="modal__field">
              <label className="modal__label">Assignees</label>
              <div className="modal__assignees">
                {/* Existing users as toggleable chips */}
                {users.map(u => (
                  <button
                    key={u}
                    type="button"
                    className={`modal__assignee-chip ${form.assignees.includes(u) ? 'modal__assignee-chip--selected' : ''}`}
                    onClick={() => toggleAssignee(u)}
                  >
                    {u}
                  </button>
                ))}
                {/* Custom assignees added via input (not in users list) */}
                {form.assignees.filter(a => !users.includes(a)).map(a => (
                  <button
                    key={a}
                    type="button"
                    className="modal__assignee-chip modal__assignee-chip--selected"
                    onClick={() => toggleAssignee(a)}
                  >
                    {a}
                  </button>
                ))}
              </div>
              {/* Inline input to add a name not in the users list */}
              <div className="modal__new-assignee">
                <input
                  className="modal__new-assignee-input"
                  value={newAssignee}
                  onChange={e => setNewAssignee(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addNewAssignee(); } }}
                  placeholder="Add by name..."
                />
                <button type="button" className="modal__new-assignee-btn" onClick={addNewAssignee}>
                  + Add
                </button>
              </div>
            </div>
          )}

          <div className="modal__footer">
            <button type="button" className="modal__btn modal__btn--cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal__btn modal__btn--submit">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
