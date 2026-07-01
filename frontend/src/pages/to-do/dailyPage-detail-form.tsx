import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Star,
  Calendar,
  Circle,
  CheckCircle2,
  X,
  Sun,
  Bell,
  RefreshCw,
  Tag,
  Paperclip,
  Trash2,
  GripVertical,
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import DatePickerDropdown from './DatePickerDropdown';
import ReminderPickerDropdown from './ReminderPickerDropdown';
import RepeatPickerDropdown from './RepeatPickerDropdown';

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

interface TaskDetailPanelProps {
  selectedTask: Task | null;
  setSelectedTask: (task: Task | null) => void;
  updateTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  toggleStepComplete: (stepId: string) => void;
  updateStep: (stepId: string, text: string) => void;
  deleteStep: (stepId: string) => void;
  addStep: () => void;
  categories: Categories;
  // Date picker props
  showTaskDatePicker: boolean;
  setShowTaskDatePicker: (show: boolean) => void;
  showTaskCalendar: boolean;
  setShowTaskCalendar: (show: boolean) => void;
  taskCalendarDate: Date;
  setTaskCalendarDate: (date: Date) => void;
  taskDatePickerRef: React.RefObject<HTMLDivElement | null>;
  getTaskDateLabel: (dueDate: string) => string;
  clearTaskDueDate: () => void;
  // Date helper functions
  getToday: () => Date;
  getTomorrow: () => Date;
  getNextWeek: () => Date;
  getDayName: (date: Date, short?: boolean) => string;
  getDaysInMonth: (date: Date) => number;
  getFirstDayOfMonth: (date: Date) => number;
  formatDateForInput: (date: Date) => string;
  // Reminder picker props
  showTaskReminderPicker: boolean;
  setShowTaskReminderPicker: (show: boolean) => void;
  showTaskReminderDateTime: boolean;
  setShowTaskReminderDateTime: (show: boolean) => void;
  taskReminderDate: Date;
  setTaskReminderDate: (date: Date) => void;
  taskReminderTime: string;
  setTaskReminderTime: (time: string) => void;
  taskReminderPickerRef: React.RefObject<HTMLDivElement | null>;
  selectedTaskReminder: string;
  getTaskReminderLabel: () => { label: string; icon: React.ReactNode } | null;
  selectTaskQuickReminder: (type: string, date: Date) => void;
  clearTaskReminder: () => void;
  saveTaskReminderDateTime: () => void;
  getLaterToday: () => Date;
  getTomorrowAt9: () => Date;
  getNextWeekAt9: () => Date;
  // Repeat picker props
  showTaskRepeatPicker: boolean;
  setShowTaskRepeatPicker: (show: boolean) => void;
  taskRepeatPickerRef: React.RefObject<HTMLDivElement | null>;
  selectedTaskRepeat: string;
  getTaskRepeatLabel: () => { label: string; icon: React.ReactNode } | null;
  selectTaskRepeat: (type: string) => void;
  clearTaskRepeat: () => void;
}

// Action Item Component
const ActionItem = ({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${active ? 'text-primary' : 'text-foreground'}`}
  >
    <span className={active ? 'text-primary' : 'text-muted-foreground'}>{icon}</span>
    <span className="flex-1 text-sm">{label}</span>
  </button>
);

const TaskDetailPanel: React.FC<TaskDetailPanelProps> = ({
  selectedTask,
  setSelectedTask,
  updateTask,
  deleteTask,
  toggleStepComplete,
  updateStep,
  deleteStep,
  addStep,
  categories,
  showTaskDatePicker,
  setShowTaskDatePicker,
  showTaskCalendar,
  setShowTaskCalendar,
  taskCalendarDate,
  setTaskCalendarDate,
  taskDatePickerRef,
  getTaskDateLabel,
  clearTaskDueDate,
  getToday,
  getTomorrow,
  getNextWeek,
  getDayName,
  getDaysInMonth,
  getFirstDayOfMonth,
  formatDateForInput,
  // Reminder props
  showTaskReminderPicker,
  setShowTaskReminderPicker,
  showTaskReminderDateTime,
  setShowTaskReminderDateTime,
  taskReminderDate,
  setTaskReminderDate,
  taskReminderTime,
  setTaskReminderTime,
  taskReminderPickerRef,
  selectedTaskReminder,
  getTaskReminderLabel,
  selectTaskQuickReminder,
  clearTaskReminder,
  saveTaskReminderDateTime,
  getLaterToday,
  getTomorrowAt9,
  getNextWeekAt9,
  // Repeat props
  showTaskRepeatPicker,
  setShowTaskRepeatPicker,
  taskRepeatPickerRef,
  selectedTaskRepeat,
  getTaskRepeatLabel,
  selectTaskRepeat,
  clearTaskRepeat,
}) => {
  const { isSmallScreen } = useBreakpoint();

  // Resize state
  const [panelWidth, setPanelWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  
  // Delete confirmation state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const MIN_WIDTH = 350;
  const MAX_WIDTH = 700;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    // Calculate new width based on mouse position from right edge of viewport
    const newWidth = window.innerWidth - e.clientX;
    
    // Clamp the width between min and max
    if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
      setPanelWidth(newWidth);
    }
  }, [isResizing]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Bloquear scroll del body cuando el panel ocupa toda la pantalla
  useEffect(() => {
    if (isSmallScreen && selectedTask) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isSmallScreen, selectedTask]);

  const selectTaskQuickDate = (date: Date) => {
    if (selectedTask) {
      updateTask({ ...selectedTask, dueDate: formatDateForInput(date) });
    }
    setShowTaskDatePicker(false);
    setShowTaskCalendar(false);
  };

  const selectTaskCalendarDate = (day: number) => {
    if (selectedTask) {
      const selectedDate = new Date(taskCalendarDate.getFullYear(), taskCalendarDate.getMonth(), day);
      updateTask({ ...selectedTask, dueDate: formatDateForInput(selectedDate) });
    }
  };

  const saveTaskCalendarDate = () => {
    setShowTaskDatePicker(false);
    setShowTaskCalendar(false);
  };

  // Task DatePicker using shared component
  const renderTaskDatePicker = () => (
    <DatePickerDropdown
      pickerRef={taskDatePickerRef}
      showCalendar={showTaskCalendar}
      setShowCalendar={setShowTaskCalendar}
      calendarDate={taskCalendarDate}
      setCalendarDate={setTaskCalendarDate}
      currentDueDate={selectedTask?.dueDate || ''}
      onSelectQuickDate={selectTaskQuickDate}
      onSelectCalendarDate={selectTaskCalendarDate}
      onSaveCalendarDate={saveTaskCalendarDate}
      onClearDate={clearTaskDueDate}
      getToday={getToday}
      getTomorrow={getTomorrow}
      getNextWeek={getNextWeek}
      getDayName={getDayName}
      getDaysInMonth={getDaysInMonth}
      getFirstDayOfMonth={getFirstDayOfMonth}
    />
  );

  // Task ReminderPicker using shared component
  const selectTaskReminderCalendarDate = (day: number) => {
    const newDate = new Date(taskReminderDate.getFullYear(), taskReminderDate.getMonth(), day);
    setTaskReminderDate(newDate);
  };

  const renderTaskReminderPicker = () => (
    <ReminderPickerDropdown
      pickerRef={taskReminderPickerRef}
      showDateTime={showTaskReminderDateTime}
      setShowDateTime={setShowTaskReminderDateTime}
      selectedReminder={selectedTaskReminder ? { type: selectedTaskReminder, date: taskReminderDate } : null}
      reminderDate={taskReminderDate}
      setReminderDate={setTaskReminderDate}
      reminderTime={taskReminderTime}
      setReminderTime={setTaskReminderTime}
      onSelectQuickReminder={selectTaskQuickReminder}
      onSelectCalendarDate={selectTaskReminderCalendarDate}
      onSaveReminder={saveTaskReminderDateTime}
      onClearReminder={clearTaskReminder}
      getLaterToday={getLaterToday}
      getTomorrowAt9={getTomorrowAt9}
      getNextWeekAt9={getNextWeekAt9}
      getDayName={getDayName}
      getDaysInMonth={getDaysInMonth}
      getFirstDayOfMonth={getFirstDayOfMonth}
    />
  );

  // Task RepeatPicker using shared component
  const renderTaskRepeatPicker = () => (
    <RepeatPickerDropdown
      pickerRef={taskRepeatPickerRef}
      selectedRepeat={selectedTaskRepeat}
      onSelectRepeat={selectTaskRepeat}
      onClearRepeat={clearTaskRepeat}
    />
  );

  if (!selectedTask) return null;

  return (
    <>
      {isSmallScreen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSelectedTask(null)}
          aria-hidden="true"
        />
      )}

      <div
        className={cn(
          'relative flex flex-col bg-card',
          isSmallScreen
            ? 'fixed inset-0 z-50 h-dvh w-full max-w-full overflow-hidden'
            : 'h-[90%] border-l border-border'
        )}
        style={
          isSmallScreen
            ? undefined
            : { width: `${panelWidth}px`, minWidth: `${MIN_WIDTH}px` }
        }
      >
      {/* Resize Handle — solo escritorio */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute left-0 top-0 bottom-0 z-10 hidden w-1 cursor-ew-resize group items-center hover:bg-primary/50 lg:flex',
          isResizing && 'bg-primary/50'
        )}
      >
        <div className="absolute left-0 w-4 h-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2">
          <GripVertical className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
        </div>
      </div>

      <div className="flex flex-col flex-1 min-h-0">
        {/* Header - Task Title with checkbox and star */}
        <div className="flex items-start gap-3 p-4 border-b border-border">
          <button
            type="button"
            onClick={() => updateTask({ ...selectedTask, completed: !selectedTask.completed })}
            className="flex-shrink-0 mt-1 cursor-pointer hover:scale-110 transition-transform"
          >
            {selectedTask.completed ? (
              <CheckCircle2 className="w-6 h-6 text-primary" aria-hidden="true" />
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" aria-hidden="true" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={selectedTask.title}
              onChange={(e) => updateTask({ ...selectedTask, title: e.target.value })}
              className={`w-full text-base font-medium border-none outline-none bg-transparent cursor-text hover:bg-muted/30 focus:bg-muted/50 rounded px-1 py-0.5 transition-colors ${selectedTask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                  placeholder="Título de la tarea…"
            />
          </div>

          <button
            type="button"
            onClick={() => updateTask({ ...selectedTask, importance: selectedTask.importance === 'high' ? 'normal' : 'high' })}
            className="flex-shrink-0 mt-1 cursor-pointer hover:scale-110 transition-transform"
          >
            {selectedTask.importance === 'high' ? (
              <Star className="w-5 h-5 fill-primary text-primary" aria-hidden="true" />
            ) : (
              <Star className="w-5 h-5 text-muted-foreground hover:text-primary" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSelectedTask(null)}
            className="flex-shrink-0 mt-1 p-1 hover:bg-muted rounded transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground hover:text-foreground cursor-pointer" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Steps Section */}
          <div className="border-b border-border">
            {selectedTask.steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30 group">
                <button
                  type="button"
                  onClick={() => toggleStepComplete(step.id)}
                  className="flex-shrink-0"
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-primary cursor-pointer" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-primary cursor-pointer" />
                  )}
                </button>
                <input
                  type="text"
                  value={step.text}
                  onChange={(e) => updateStep(step.id, e.target.value)}
                  placeholder="Describe el paso..."
                  className={`flex-1 bg-transparent border-none outline-none text-sm ${step.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
                />
                <button
                  type="button"
                  onClick={() => deleteStep(step.id)}
                  className="flex-shrink-0 p-1 hover:bg-muted rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-muted-foreground cursor-pointer" />
                </button>
              </div>
            ))}

            {/* Add Step Button */}
            <button
              type="button"
              onClick={() => addStep()}
              className="w-full flex items-center gap-3 px-4 py-3 text-primary hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              <span className="text-sm">Paso siguiente</span>
            </button>
          </div>

          {/* Action Items */}
          <div className="border-b border-border">
            <ActionItem
              icon={<Sun className="w-5 h-5" />}
              label="Agregar a Mi día"
              onClick={() => {}}
            />
            <div className="relative">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskReminderPicker(!showTaskReminderPicker);
                    setShowTaskReminderDateTime(false);
                  }}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${selectedTaskReminder ? 'text-primary' : 'text-foreground'}`}
                >
                  <Bell className={`w-5 h-5 ${selectedTaskReminder ? 'text-primary' : 'text-muted-foreground'} cursor-pointer`} />
                  <span className="text-sm cursor-pointer">
                    {getTaskReminderLabel()?.label || 'Recordarme'}
                  </span>
                </button>
                {selectedTaskReminder && (
                  <button
                    type="button"
                    onClick={() => clearTaskReminder()}
                    className="px-3 py-3 hover:bg-muted/50 transition-colors"
                    title="Quitar recordatorio"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </button>
                )}
              </div>
              {showTaskReminderPicker && renderTaskReminderPicker()}
            </div>
            <div className="relative">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskDatePicker(!showTaskDatePicker);
                    setShowTaskCalendar(false);
                  }}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${selectedTask.dueDate ? 'text-primary' : 'text-foreground'}`}
                >
                  <Calendar className={`w-5 h-5 ${selectedTask.dueDate ? 'text-primary' : 'text-muted-foreground'} cursor-pointer`} />
                  <span className="text-sm cursor-pointer">{getTaskDateLabel(selectedTask.dueDate)}</span>
                </button>
                {selectedTask.dueDate && (
                  <button
                    type="button"
                    onClick={() => clearTaskDueDate()}
                    className="px-3 py-3 hover:bg-muted/50 transition-colors"
                    title="Quitar fecha"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </button>
                )}
              </div>
              {showTaskDatePicker && renderTaskDatePicker()}
            </div>
            <div className="relative">
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => setShowTaskRepeatPicker(!showTaskRepeatPicker)}
                  className={`flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${selectedTaskRepeat ? 'text-primary' : 'text-foreground'}`}
                >
                  <RefreshCw className={`w-5 h-5 ${selectedTaskRepeat ? 'text-primary' : 'text-muted-foreground'} cursor-pointer`} />
                  <span className="text-sm cursor-pointer">
                    {getTaskRepeatLabel()?.label || 'Repetir'}
                  </span>
                </button>
                {selectedTaskRepeat && (
                  <button
                    type="button"
                    onClick={() => clearTaskRepeat()}
                    className="px-3 py-3 hover:bg-muted/50 transition-colors"
                    title="Quitar repetición"
                  >
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                  </button>
                )}
              </div>
              {showTaskRepeatPicker && renderTaskRepeatPicker()}
            </div>
          </div>

          {/* Category */}
          <div className="border-b border-border">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3 mb-2">
                <Tag className="w-5 h-5 text-muted-foreground" />
                <span className="text-sm text-foreground">Elige una categoría</span>
              </div>
              <Select
                value={selectedTask.category}
                onValueChange={(value) => updateTask({ ...selectedTask, category: value })}
              >
                <SelectTrigger className="w-full cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categories).map(([key, cat]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2 cursor-pointer">
                        <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                        {cat.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add File */}
          <div className="border-b border-border">
            <ActionItem
              icon={<Paperclip className="w-5 h-5 cursor-pointer" aria-hidden="true" />}
              label="Agregar archivo"
              onClick={() => {}}
            />
          </div>

          {/* Notes/Description */}
          <div className="p-4">
            <Textarea
              value={selectedTask.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateTask({ ...selectedTask, description: e.target.value })
              }
              placeholder="Agregar nota..."
              className="w-full min-h-[100px] text-sm resize-none"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Footer - Outside scrollable area, always at bottom */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30 mt-auto">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="w-4 h-4" aria-hidden="true" />
          <span>Creada el {selectedTask.createdAt}</span>
        </div>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="p-2 hover:bg-muted rounded text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="w-5 h-5 cursor-pointer" />
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Eliminar tarea"
        description={
          <>
            ¿Estás seguro de que deseas eliminar la tarea{' '}
            <strong>{selectedTask.title || 'Sin título'}</strong>? Esta acción no se puede deshacer.
          </>
        }
        onConfirm={() => {
          deleteTask(selectedTask.id);
          setShowDeleteConfirm(false);
        }}
      />
    </div>
    </>
  );
};

export default TaskDetailPanel;