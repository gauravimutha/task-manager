import './TeamList.css';

/**
 * TeamList
 *
 * Props:
 *   workload: [{ name: string, inProgressCount: number }]
 *             — produced by useWorkload(); swap hook for API data when backend is ready
 */
export default function TeamList({ workload }) {
  return (
    <aside className="team-list">
      <p className="team-list__heading">Team</p>

      {workload.map(({ name, inProgressCount }) => {
        const overloaded = inProgressCount > 5;
        return (
          <div key={name} className="team-list__item">
            <div
              className={`team-list__avatar${overloaded ? ' team-list__avatar--overloaded' : ''}`}
              title={overloaded ? 'High workload' : undefined}
            >
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="team-list__info">
              <span className="team-list__name">{name}</span>
              <span className={`team-list__count${overloaded ? ' team-list__count--overloaded' : ''}`}>
                {inProgressCount} in progress
              </span>
            </div>
          </div>
        );
      })}
    </aside>
  );
}
