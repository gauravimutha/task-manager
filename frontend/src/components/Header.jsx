import './Header.css';

export default function Header({ onCreateTask, onAddUser }) {
  return (
    <header className="header">
      <div className="header__brand">
        <div className="header__logo" />
        <span className="header__title">KanbanFlow</span>
      </div>
      <div className="header__actions">
        <button className="header__btn header__btn--secondary" onClick={onAddUser}>
          + Add User
        </button>
        <button className="header__btn header__btn--primary" onClick={onCreateTask}>
          + New Task
        </button>
      </div>
    </header>
  );
}
