import React from 'react';
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Bell,
  Star
} from 'lucide-react';

// Types
interface Step {
  id: string;
  text: string;
  completed: boolean;
}

interface Task {
  id: string;
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

interface Category {
  name: string;
  color: string;
}

interface Categories {
  [key: string]: Category;
}

interface ExpandedCategories {
  [key: string]: boolean;
}

interface TaskCategoryListProps {
  categories: Categories;
  expandedCategories: ExpandedCategories;
  selectedTask: Task | null;
  getTasksByCategory: (category: string) => Task[];
  toggleCategory: (category: string) => void;
  handleSelectTask: (task: Task) => void;
  toggleTaskComplete: (taskId: string) => void;
  toggleTaskImportance: (taskId: string) => void;
  getTaskDateLabelForList: (dueDate: string) => string;
  getTaskReminderLabelForList: (task: Task) => string;
}

// Importance Icon Component
const ImportanceIcon = ({ level }: { level: 'normal' | 'medium' | 'high' }) => {
  if (level === 'high') {
    return <Star className="w-4 h-4 fill-primary text-primary" aria-hidden="true" />;
  }
  return <Star className="w-4 h-4 text-muted-foreground hover:text-primary" aria-hidden="true" />;
};

const TaskCategoryList: React.FC<TaskCategoryListProps> = ({
  categories,
  expandedCategories,
  selectedTask,
  getTasksByCategory,
  toggleCategory,
  handleSelectTask,
  toggleTaskComplete,
  toggleTaskImportance,
  getTaskDateLabelForList,
  getTaskReminderLabelForList,
}) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {Object.entries(categories).map(([key, category]) => {
        const categoryTasks = getTasksByCategory(key);
        if (categoryTasks.length === 0) return null;

        return (
          <div key={key} className="border-b border-border last:border-b-0">
            <button
              onClick={() => toggleCategory(key)}
              className="w-full flex items-center gap-2 p-4 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={expandedCategories[key]}
              aria-label={`${expandedCategories[key] ? 'Ocultar' : 'Mostrar'} categoría ${category.name}`}
            >
              {expandedCategories[key] ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              )}
              <span className="font-medium text-foreground">{category.name}</span>
              <span className="text-sm text-muted-foreground">{categoryTasks.length}</span>
            </button>

            {expandedCategories[key] && (
              <div>
                {categoryTasks.map(task => (
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
                      className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      aria-label={task.completed ? "Marcar como no completada" : "Marcar como completada"}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-primary cursor-pointer" aria-hidden="true" />
                      ) : (
                        <Circle className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" aria-hidden="true" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      {/* Task indicators */}
                      {(task.dueDate || task.reminder || task.repeat || task.steps.length > 0) && (
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          {/* Steps progress indicator */}
                          {task.steps.length > 0 && (
                            <span className="flex items-center gap-1">
                              <span>{task.steps.filter(s => s.completed).length} de {task.steps.length}</span>
                            </span>
                          )}
                          {task.dueDate && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-primary" aria-hidden="true" />
                              <span>{getTaskDateLabelForList(task.dueDate)}</span>
                            </span>
                          )}
                          {task.repeat && (
                            <span className="flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 text-primary" aria-hidden="true" />
                            </span>
                          )}
                          {task.reminder && (
                            <span className="flex items-center gap-1">
                              <Bell className="w-3 h-3 text-primary" aria-hidden="true" />
                              <span>{getTaskReminderLabelForList(task)}</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
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
      })}
    </div>
  );
};

export default TaskCategoryList;
