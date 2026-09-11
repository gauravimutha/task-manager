import { useState } from 'react';
import './AddUserModal.css';

export default function AddUserModal({ users, onClose, onAddUser, onRemoveUser }) {
  const [input, setInput] = useState('');

  function handleAdd() {
    const name = input.trim();
    if (!name || users.includes(name)) return;
    onAddUser(name);
    setInput('');
  }

  function handleKey(e) {
    if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
  }

  return (
    <div className="add-user-overlay" onClick={onClose}>
      <div className="add-user-modal" onClick={e => e.stopPropagation()}>
        <p className="add-user-modal__title">Manage Users</p>

        <div className="add-user-modal__input-row">
          <input
            className="add-user-modal__input"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Enter name..."
            autoFocus
          />
          <button className="add-user-modal__add-btn" onClick={handleAdd}>Add</button>
        </div>

        <div className="add-user-modal__label">Current Users</div>
        <div className="add-user-modal__list">
          {users.length === 0 && (
            <span style={{ color: '#3a3f5c', fontSize: '0.78rem' }}>No users yet</span>
          )}
          {users.map(u => (
            <span key={u} className="add-user-modal__user">
              {u}
              <button
                className="add-user-modal__remove"
                onClick={() => onRemoveUser(u)}
                title="Remove"
              >✕</button>
            </span>
          ))}
        </div>

        <button className="add-user-modal__close" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}
