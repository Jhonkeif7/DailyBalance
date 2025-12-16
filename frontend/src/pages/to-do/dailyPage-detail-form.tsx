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
  AlertTriangle
} from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/Button';
import DatePickerDropdown from './DatePickerDropdown';
import ReminderPickerDropdown from './ReminderPickerDropdown';
import RepeatPickerDropdown from './RepeatPickerDropdown';

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
  deleteTask: (taskId: number) => void;
  toggleStepComplete: (stepId: number) => void;
  updateStep: (stepId: number, text: string) => void;
  deleteStep: (stepId: number) => void;
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
    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${active ? 'text-blue-500' : 'text-foreground'}`}
  >
    <span className={active ? 'text-blue-500' : 'text-muted-foreground'}>{icon}</span>
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
    <div 
      className="h-[90%] bg-card border-l border-border flex flex-col relative"
      style={{ width: `${panelWidth}px`, minWidth: `${MIN_WIDTH}px` }}
    >
      {/* Resize Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500/50 transition-colors z-10 group flex items-center ${isResizing ? 'bg-blue-500/50' : ''}`}
      >
        <div className="absolute left-0 w-4 h-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2">
          <GripVertical className="w-4 h-4 text-muted-foreground" />
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
              <CheckCircle2 className="w-6 h-6 text-blue-500" />
            ) : (
              <Circle className="w-6 h-6 text-muted-foreground hover:text-blue-500" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <input
              type="text"
              value={selectedTask.title}
              onChange={(e) => updateTask({ ...selectedTask, title: e.target.value })}
              className={`w-full text-base font-medium border-none outline-none bg-transparent cursor-text hover:bg-muted/30 focus:bg-muted/50 rounded px-1 py-0.5 transition-colors ${selectedTask.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}
              placeholder="Título de la tarea"
            />
          </div>

          <button
            type="button"
            onClick={() => updateTask({ ...selectedTask, importance: selectedTask.importance === 'high' ? 'normal' : 'high' })}
            className="flex-shrink-0 mt-1 cursor-pointer hover:scale-110 transition-transform"
          >
            {selectedTask.importance === 'high' ? (
              <Star className="w-5 h-5 fill-blue-500 text-blue-500" />
            ) : (
              <Star className="w-5 h-5 text-muted-foreground hover:text-blue-500" />
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
                    <CheckCircle2 className="w-5 h-5 text-blue-500 cursor-pointer" />
                  ) : (
                    <Circle className="w-5 h-5 text-muted-foreground hover:text-blue-500 cursor-pointer" />
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
              className="w-full flex items-center gap-3 px-4 py-3 text-blue-500 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <Plus className="w-5 h-5" />
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
                  className={`flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${selectedTaskReminder ? 'text-blue-500' : 'text-foreground'}`}
                >
                  <Bell className={`w-5 h-5 ${selectedTaskReminder ? 'text-blue-500' : 'text-muted-foreground'} cursor-pointer`} />
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
                  className={`flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${selectedTask.dueDate ? 'text-blue-500' : 'text-foreground'}`}
                >
                  <Calendar className={`w-5 h-5 ${selectedTask.dueDate ? 'text-blue-500' : 'text-muted-foreground'} cursor-pointer`} />
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
                  className={`flex-1 flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${selectedTaskRepeat ? 'text-blue-500' : 'text-foreground'}`}
                >
                  <RefreshCw className={`w-5 h-5 ${selectedTaskRepeat ? 'text-blue-500' : 'text-muted-foreground'} cursor-pointer`} />
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
              icon={<Paperclip className="w-5 h-5 cursor-pointer" />}
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
          <Calendar className="w-4 h-4" />
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
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <DialogTitle>Eliminar tarea</DialogTitle>
                <DialogDescription className="mt-1">
                  ¿Estás seguro que deseas eliminar esta tarea?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta acción no se puede deshacer. La tarea "<span className="font-medium text-foreground">{selectedTask.title}</span>" será eliminada permanentemente.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="mr-2 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                deleteTask(selectedTask.id);
                setShowDeleteConfirm(false);
              }}
              className="cursor-pointer"
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskDetailPanel;