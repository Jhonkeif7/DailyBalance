import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Calendar,
  Star
} from 'lucide-react';

// Types
interface Step {
  id: number;
  text: string;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  importance: 'normal' | 'medium' | 'high';
  completed: boolean;
  category: string;
  steps: Step[];
  createdAt?: string;
  reminder?: string;
  reminderDate?: string;
  reminderTime?: string;
  repeat?: string;
}

interface CompletedTasksListProps {
  completedTasks: Task[];
  selectedTask: Task | null;
  showCompleted: boolean;
  setShowCompleted: (show: boolean) => void;
  handleSelectTask: (task: Task) => void;
  toggleTaskComplete: (taskId: number) => void;
  toggleTaskImportance: (taskId: number) => void;
}

// Importance Icon Component
const ImportanceIcon = ({ level }: { level: 'normal' | 'medium' | 'high' }) => {
  if (level === 'high') {
    return <Star className="w-4 h-4 fill-blue-500 text-blue-500" />;
  }
  return <Star className="w-4 h-4 text-muted-foreground hover:text-blue-500" />;
};

const CompletedTasksList: React.FC<CompletedTasksListProps> = ({
  completedTasks,
  selectedTask,
  showCompleted,
  setShowCompleted,
  handleSelectTask,
  toggleTaskComplete,
  toggleTaskImportance,
}) => {
  if (completedTasks.length === 0) return null;

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border mt-6">
      <button
        onClick={() => setShowCompleted(!showCompleted)}
        className="w-full flex items-center gap-2 p-4 hover:bg-muted/50 transition-colors"
      >
        {showCompleted ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        <span className="font-medium text-foreground">Completado</span>
        <span className="text-sm text-muted-foreground">{completedTasks.length}</span>
      </button>

      {showCompleted && (
        <div>
          {completedTasks.map(task => (
            <div
              key={task.id}
              onClick={() => handleSelectTask(task)}
              className={`flex items-center gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-t border-border ${selectedTask?.id === task.id ? 'bg-muted/50' : ''}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTaskComplete(task.id);
                }}
                className="flex-shrink-0"
              >
                <CheckCircle2 className="w-5 h-5 text-blue-500 cursor-pointer" />
              </button>

              <div className="flex-1 min-w-0">
                <p className="text-sm line-through text-muted-foreground">
                  {task.title}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {task.dueDate && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {task.dueDate}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTaskImportance(task.id);
                  }}
                  className="flex-shrink-0 hover:scale-110 transition-transform"
                  title={task.importance === 'high' ? 'Quitar importancia' : 'Marcar como importante'}
                >
                  <ImportanceIcon level={task.importance} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedTasksList;
