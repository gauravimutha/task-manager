import { Draggable } from '@hello-pangea/dnd';
import './Card.css';

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date(new Date().toDateString());
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function Card({ task, index, onDelete, onEdit }) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          className="card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            opacity: snapshot.isDragging ? 0.9 : 1,
            boxShadow: snapshot.isDragging ? '0 8px 32px rgba(108,99,255,0.25)' : undefined,
          }}
        >
          <div className="card__top">
            <span className="card__title">{task.title}</span>
            <span className={`card__priority card__priority--${task.priority}`}>
              {task.priority}
            </span>
          </div>

          {task.description && (
            <p className="card__description">{task.description}</p>
          )}

          <div className="card__footer">
            <span className={`card__due ${isOverdue(task.dueDate) ? 'card__due--overdue' : ''}`}>
              {formatDate(task.dueDate)}
            </span>

            <div className="card__assignees">
              {(task.assignees || []).slice(0, 2).map((a, i) => (
                <span key={i} className="card__name-tag" title={a}>
                  {a}
                </span>
              ))}
              {(task.assignees || []).length > 2 && (
                <span className="card__name-tag card__name-tag--more">
                  +{(task.assignees || []).length - 2}
                </span>
              )}
            </div>

            <div className="card__actions">
              <button
                className="card__edit"
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                title="Edit task"
              >
                ✎
              </button>
              <button
                className="card__delete"
                onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
                title="Delete task"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
