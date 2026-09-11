import { Droppable } from '@hello-pangea/dnd';
import Card from './Card';
import './Column.css';

const DOT_CLASS = {
  todo: 'column__dot--todo',
  inprogress: 'column__dot--inprogress',
  done: 'column__dot--done',
};

export default function Column({ column, tasks, onDeleteTask, onAddTask, onEditTask }) {
  return (
    <div className="column">
      <div className="column__header">
        <div className="column__title-wrap">
          <span className={`column__dot ${DOT_CLASS[column.id]}`} />
          <span className="column__title">{column.title}</span>
        </div>
        <span className="column__badge">{tasks.length}</span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            className={`column__cards ${snapshot.isDraggingOver ? 'column--drag-over' : ''}`}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="column__placeholder">Drop tasks here</div>
            )}
            {tasks.map((task, index) => (
              <Card
                key={task.id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <button className="column__add-btn" onClick={() => onAddTask(column.id)}>
        + Add Task
      </button>
    </div>
  );
}
