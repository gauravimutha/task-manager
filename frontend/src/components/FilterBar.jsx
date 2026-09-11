import './FilterBar.css';

const FILTERS = ['all', 'high', 'medium', 'low'];

export default function FilterBar({ activeFilter, onFilterChange, taskCount }) {
  return (
    <div className="filterbar">
      <span className="filterbar__label">Filter by Priority:</span>
      {FILTERS.map(f => (
        <button
          key={f}
          className={`filterbar__btn filterbar__btn--${f} ${activeFilter === f ? 'filterbar__btn--active' : ''}`}
          onClick={() => onFilterChange(f)}
        >
          {f.charAt(0).toUpperCase() + f.slice(1)}
        </button>
      ))}
      <span className="filterbar__count">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
    </div>
  );
}
